import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { matchesBranch, matchesBranchList } from '@/lib/branchMatcher';

export interface SearchResultItem {
  id: string;
  category: 'pages' | 'drives' | 'candidates' | 'companies';
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
  meta?: string;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();
    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const role = session.user.role;
    const qLower = query.toLowerCase();
    const results: SearchResultItem[] = [];

    // 1. Navigation / Quick Links based on role
    const navItems: Record<string, { title: string; subtitle: string; url: string; keywords: string[] }[]> = {
      STUDENT: [
        {
          title: 'Explore Placement Drives',
          subtitle: 'Browse open campus drives, verify criteria & apply',
          url: `/student/drives?search=${encodeURIComponent(query)}`,
          keywords: ['drive', 'drives', 'job', 'jobs', 'placement', 'company', 'apply', 'campus', 'mechanical', 'mech', 'cse', 'ece', 'it'],
        },
        {
          title: 'My Applications',
          subtitle: 'Track your application status and interview calls',
          url: '/student/applications',
          keywords: ['application', 'applications', 'applied', 'status', 'interview', 'offer', 'track'],
        },
        {
          title: 'Mock Tests & Assessments',
          subtitle: 'Practice aptitude, technical tests & coding questions',
          url: '/student/mock-tests',
          keywords: ['mock', 'test', 'exam', 'quiz', 'aptitude', 'technical', 'practice'],
        },
        {
          title: 'AI Video Interviews',
          subtitle: 'Simulate technical and HR interviews with AI feedback',
          url: '/student/video-interviews',
          keywords: ['video', 'interview', 'ai', 'mock interview', 'practice interview'],
        },
        {
          title: 'Student Profile & Resume',
          subtitle: 'Update academic record, resume, skills and projects',
          url: '/student/profile',
          keywords: ['profile', 'resume', 'skills', 'cgpa', 'projects', 'experience', 'branch'],
        },
        {
          title: 'Account Settings',
          subtitle: 'Manage security, password and notification preferences',
          url: '/student/settings',
          keywords: ['settings', 'password', 'security', 'preferences'],
        },
      ],
      RECRUITER: [
        {
          title: 'Manage Placement Drives',
          subtitle: 'Monitor all published hiring drives and applicant pools',
          url: `/recruiter/drives?search=${encodeURIComponent(query)}`,
          keywords: ['drive', 'drives', 'manage', 'candidates', 'applicants', 'mechanical', 'mech', 'cse', 'pipeline'],
        },
        {
          title: 'Post New Placement Drive',
          subtitle: 'Create a new campus hiring drive with eligibility rules',
          url: '/recruiter/drives/new',
          keywords: ['post', 'new', 'create', 'drive', 'hiring', 'job', 'vacancy'],
        },
        {
          title: 'Company Profile',
          subtitle: 'Update enterprise overview, logo and recruiter contact',
          url: '/recruiter/company',
          keywords: ['company', 'profile', 'organization', 'recruiter', 'about'],
        },
        {
          title: 'Placement Analytics',
          subtitle: 'Inspect hiring funnels, offer acceptance and interview metrics',
          url: '/recruiter/analytics',
          keywords: ['analytics', 'metrics', 'funnel', 'stats', 'report'],
        },
        {
          title: 'Recruiter Settings',
          subtitle: 'Manage recruiter profile, credentials and notifications',
          url: '/recruiter/settings',
          keywords: ['settings', 'password', 'security', 'profile'],
        },
      ],
      ADMIN: [
        {
          title: 'Campus Placement Drives',
          subtitle: 'Inspect all drives across companies, batches and departments',
          url: `/admin/drives?search=${encodeURIComponent(query)}`,
          keywords: ['drive', 'drives', 'placement', 'company', 'admin', 'mechanical', 'mech', 'cse'],
        },
        {
          title: 'Student Directory',
          subtitle: 'Look up student profiles, academic records and branches',
          url: `/admin/students?search=${encodeURIComponent(query)}`,
          keywords: ['student', 'students', 'directory', 'roll', 'batch', 'branch', 'mechanical', 'mech', 'cse', 'cgpa'],
        },
        {
          title: 'Partner Companies Directory',
          subtitle: 'Manage recruiter organizations and verification statuses',
          url: `/admin/companies?search=${encodeURIComponent(query)}`,
          keywords: ['company', 'companies', 'recruiter', 'partners', 'registry'],
        },
        {
          title: 'TPO Placement Analytics',
          subtitle: 'Campus-wide placement percentage, CTC trends & packages',
          url: '/admin/analytics',
          keywords: ['analytics', 'reports', 'tpo', 'charts', 'placement rate', 'ctc'],
        },
        {
          title: 'System Settings',
          subtitle: 'Configure academic batches, portal settings and access',
          url: '/admin/settings',
          keywords: ['settings', 'system', 'admin', 'config'],
        },
      ],
    };

    const roleNavs = navItems[role] || [];
    for (const item of roleNavs) {
      const match =
        item.title.toLowerCase().includes(qLower) ||
        item.subtitle.toLowerCase().includes(qLower) ||
        item.keywords.some((k) => k.includes(qLower) || qLower.includes(k));
      if (match) {
        results.push({
          id: `page-${item.url}`,
          category: 'pages',
          title: item.title,
          subtitle: item.subtitle,
          url: item.url,
        });
      }
    }

    // 2. Role-specific Database Search
    if (role === 'STUDENT') {
      // Search LIVE placement drives
      const drives = await prisma.drive.findMany({
        where: { status: 'LIVE' },
        include: {
          company: { select: { id: true, name: true, industry: true, logoUrl: true } },
          eligibilityCriteria: { select: { minCGPA: true, allowedBranches: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      const matchedDrives = drives.filter((d) => {
        const titleMatch = d.title.toLowerCase().includes(qLower);
        const compMatch = d.company?.name?.toLowerCase().includes(qLower);
        const locMatch = d.location?.toLowerCase().includes(qLower);
        const descMatch = d.description?.toLowerCase().includes(qLower);
        const branchMatch = matchesBranchList(d.eligibilityCriteria?.allowedBranches, query);
        return titleMatch || compMatch || locMatch || descMatch || branchMatch;
      });

      for (const d of matchedDrives.slice(0, 5)) {
        const branchText = d.eligibilityCriteria?.allowedBranches?.length
          ? d.eligibilityCriteria.allowedBranches.join(', ')
          : 'All branches';
        results.push({
          id: `drive-${d.id}`,
          category: 'drives',
          title: d.title,
          subtitle: `${d.company?.name || 'Company'} • ₹${d.ctcMin}–${d.ctcMax} LPA • ${d.location || 'Campus'}`,
          url: `/student/drives?search=${encodeURIComponent(query)}`,
          badge: d.status,
          meta: `Eligible: ${branchText}`,
        });
      }

      // Search partner companies
      const companies = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { industry: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 4,
      });

      for (const c of companies) {
        results.push({
          id: `comp-${c.id}`,
          category: 'companies',
          title: c.name,
          subtitle: `${c.industry || 'Organization'} • ${c.address || 'Campus Partner'}`,
          url: `/student/drives?search=${encodeURIComponent(c.name)}`,
          badge: c.verified ? 'VERIFIED' : undefined,
        });
      }
    } else if (role === 'RECRUITER') {
      const recruiter = await prisma.recruiterProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (recruiter) {
        // Search recruiter's own drives
        const drives = await prisma.drive.findMany({
          where: { recruiterId: recruiter.id },
          include: {
            applications: { select: { id: true } },
            eligibilityCriteria: { select: { allowedBranches: true } },
          },
          orderBy: { createdAt: 'desc' },
        });

        const matchedDrives = drives.filter((d) => {
          const titleMatch = d.title.toLowerCase().includes(qLower);
          const locMatch = d.location?.toLowerCase().includes(qLower);
          const branchMatch = matchesBranchList(d.eligibilityCriteria?.allowedBranches, query);
          return titleMatch || locMatch || branchMatch;
        });

        for (const d of matchedDrives.slice(0, 5)) {
          results.push({
            id: `drive-${d.id}`,
            category: 'drives',
            title: d.title,
            subtitle: `${d.jobType} • ${d.location || 'On-site'} • ${d.applications.length} applicants`,
            url: `/recruiter/drives/${d.id}`,
            badge: d.status,
          });
        }

        // Search candidate applications in this recruiter's drives
        const applications = await prisma.application.findMany({
          where: { drive: { recruiterId: recruiter.id } },
          include: {
            drive: { select: { id: true, title: true } },
            student: {
              include: {
                user: { select: { email: true } },
              },
            },
          },
          take: 100,
        });

        const matchedApps = applications.filter((a) => {
          const student = a.student;
          if (!student) return false;
          const nameMatch = student.fullName.toLowerCase().includes(qLower);
          const emailMatch = student.user?.email.toLowerCase().includes(qLower);
          const rollMatch = student.rollNumber.toLowerCase().includes(qLower);
          const branchMatch = matchesBranch(student.branch, query);
          const skillsMatch = student.skills.some((s) => s.toLowerCase().includes(qLower));
          return nameMatch || emailMatch || rollMatch || branchMatch || skillsMatch;
        });

        for (const a of matchedApps.slice(0, 6)) {
          results.push({
            id: `candidate-${a.id}`,
            category: 'candidates',
            title: a.student.fullName || 'Candidate',
            subtitle: `${a.student.branch || 'Branch N/A'} • Roll: ${a.student.rollNumber || '—'} • ${a.drive.title}`,
            url: `/recruiter/drives/${a.drive.id}?search=${encodeURIComponent(a.student.fullName || a.student.rollNumber)}`,
            badge: a.stage,
          });
        }
      }
    } else if (role === 'ADMIN') {
      // Search drives
      const drives = await prisma.drive.findMany({
        include: {
          company: { select: { name: true } },
          eligibilityCriteria: { select: { allowedBranches: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 40,
      });

      const matchedDrives = drives.filter((d) => {
        const titleMatch = d.title.toLowerCase().includes(qLower);
        const compMatch = d.company?.name?.toLowerCase().includes(qLower);
        const locMatch = d.location?.toLowerCase().includes(qLower);
        const branchMatch = matchesBranchList(d.eligibilityCriteria?.allowedBranches, query);
        return titleMatch || compMatch || locMatch || branchMatch;
      });

      for (const d of matchedDrives.slice(0, 4)) {
        results.push({
          id: `drive-${d.id}`,
          category: 'drives',
          title: d.title,
          subtitle: `${d.company?.name || 'Company'} • ${d.location || 'On-site'} • Status: ${d.status}`,
          url: `/admin/drives?search=${encodeURIComponent(d.title)}`,
          badge: d.status,
        });
      }

      // Search students
      const students = await prisma.studentProfile.findMany({
        include: {
          user: { select: { email: true } },
        },
        take: 50,
      });

      const matchedStudents = students.filter((s) => {
        const nameMatch = s.fullName.toLowerCase().includes(qLower);
        const emailMatch = s.user?.email.toLowerCase().includes(qLower);
        const rollMatch = s.rollNumber.toLowerCase().includes(qLower);
        const branchMatch = matchesBranch(s.branch, query);
        const skillsMatch = s.skills.some((sk) => sk.toLowerCase().includes(qLower));
        return nameMatch || emailMatch || rollMatch || branchMatch || skillsMatch;
      });

      for (const s of matchedStudents.slice(0, 5)) {
        results.push({
          id: `student-${s.id}`,
          category: 'candidates',
          title: s.fullName || 'Student',
          subtitle: `${s.branch || 'Branch N/A'} • Roll: ${s.rollNumber || '—'} • ${s.user?.email || ''}`,
          url: `/admin/students?search=${encodeURIComponent(s.fullName || s.rollNumber)}`,
          badge: s.isPlaced ? 'PLACED' : 'UNPLACED',
        });
      }

      // Search companies
      const companies = await prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { industry: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 4,
      });

      for (const c of companies) {
        results.push({
          id: `comp-${c.id}`,
          category: 'companies',
          title: c.name,
          subtitle: `${c.industry || 'Organization'} • ${c.address || 'Partner'}`,
          url: `/admin/companies/${c.id}`,
          badge: c.verified ? 'VERIFIED' : undefined,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in /api/search:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}

