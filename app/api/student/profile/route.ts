import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      academicRecords: true,
      projects: true,
      workExperiences: true,
    },
  });

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    fullName,
    phone,
    dateOfBirth,
    gender,
    address,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
    branch,
    batch,
    cgpa,
    backlogs,
    rollNumber,
    skills,
    resumeUrl,
  } = body;

  // Calculate completeness score based on filled fields
  let score = 20; // base score
  if (fullName && phone && rollNumber) score += 20;
  if (branch && batch && cgpa !== undefined) score += 20;
  if (skills && skills.length > 0) score += 20;
  if (resumeUrl || linkedinUrl) score += 20;

  const profile = await prisma.studentProfile.upsert({
    where: { userId: session.user.id },
    update: {
      fullName,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      branch,
      batch: batch ? Number(batch) : undefined,
      cgpa: cgpa !== undefined ? Number(cgpa) : undefined,
      backlogs: backlogs !== undefined ? Number(backlogs) : undefined,
      rollNumber,
      skills: Array.isArray(skills) ? skills : [],
      completenessScore: score,
      resumeUrl: resumeUrl || undefined,
    },
    create: {
      userId: session.user.id,
      fullName: fullName || '',
      phone: phone || '',
      branch: branch || 'CSE',
      batch: batch ? Number(batch) : 2025,
      cgpa: cgpa !== undefined ? Number(cgpa) : 0,
      backlogs: backlogs !== undefined ? Number(backlogs) : 0,
      rollNumber: rollNumber || 'ROLL001',
      skills: Array.isArray(skills) ? skills : [],
      completenessScore: score,
      resumeUrl: resumeUrl || undefined,
    },
  });

  return NextResponse.json({ success: true, profile });
}
