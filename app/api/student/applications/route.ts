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
  });

  if (!profile) {
    return NextResponse.json({ applications: [] });
  }

  const applications = await prisma.application.findMany({
    where: { studentId: profile.id },
    include: {
      drive: {
        include: {
          company: true,
          rounds: { orderBy: { roundNumber: 'asc' } },
        },
      },
      stageHistory: {
        orderBy: { changedAt: 'desc' },
      },
      interviewSlots: true,
    },
    orderBy: { appliedAt: 'desc' },
  });

  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { driveId } = await request.json();

  if (!driveId) {
    return NextResponse.json({ error: 'Drive ID is required.' }, { status: 400 });
  }

  // Ensure student profile exists
  let profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    profile = await prisma.studentProfile.create({
      data: {
        userId: session.user.id,
        fullName: session.user.name || session.user.email.split('@')[0],
        branch: 'CSE',
        batch: 2025,
        cgpa: 8.0,
        backlogs: 0,
        rollNumber: `STU${Date.now().toString().slice(-6)}`,
        completenessScore: 70,
      },
    });
  }

  // Check if already applied
  const existingApp = await prisma.application.findUnique({
    where: {
      studentId_driveId: {
        studentId: profile.id,
        driveId,
      },
    },
  });

  if (existingApp) {
    return NextResponse.json({
      success: true,
      alreadyApplied: true,
      application: existingApp,
      message: 'You have already applied for this drive.',
    });
  }

  // Check drive
  const drive = await prisma.drive.findUnique({
    where: { id: driveId },
    include: { eligibilityCriteria: true },
  });

  if (!drive || drive.status !== 'LIVE') {
    return NextResponse.json({ error: 'Drive is not active or has closed.' }, { status: 400 });
  }

  // Check eligibility criteria
  const crit = drive.eligibilityCriteria;
  if (crit) {
    if (profile.cgpa < crit.minCGPA) {
      return NextResponse.json({ error: `CGPA requirement not met (min ${crit.minCGPA}, your CGPA: ${profile.cgpa})` }, { status: 400 });
    }
    if (profile.backlogs > crit.maxBacklogs) {
      return NextResponse.json({ error: `Backlogs exceed limit (max ${crit.maxBacklogs}, you have ${profile.backlogs})` }, { status: 400 });
    }
    if (crit.allowedBranches.length > 0 && !crit.allowedBranches.includes(profile.branch)) {
      return NextResponse.json({ error: `Branch ${profile.branch} is not eligible for this drive (Allowed: ${crit.allowedBranches.join(', ')})` }, { status: 400 });
    }
  }

  // Create application & stage history
  const app = await prisma.application.create({
    data: {
      studentId: profile.id,
      driveId: drive.id,
      stage: 'APPLIED',
      stageHistory: {
        create: [{ stage: 'APPLIED', changedById: session.user.id, notes: '1-Click application submitted by student.' }],
      },
    },
  });

  // Create in-app notification
  await prisma.notification.create({
    data: {
      userId: session.user.id,
      type: 'APPLICATION_UPDATE',
      title: 'Application Submitted',
      message: `You successfully applied for ${drive.title}.`,
      link: `/student/applications`,
    },
  });

  return NextResponse.json({ success: true, application: app });
}
