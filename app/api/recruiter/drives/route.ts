import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'RECRUITER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const recruiterProfile = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    include: { company: true },
  });

  if (!recruiterProfile) {
    return NextResponse.json({ error: 'Recruiter profile not found' }, { status: 404 });
  }

  const drives = await prisma.drive.findMany({
    where: { recruiterId: recruiterProfile.id },
    include: {
      company: true,
      eligibilityCriteria: true,
      rounds: { orderBy: { roundNumber: 'asc' } },
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ drives, company: recruiterProfile.company });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'RECRUITER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const recruiterProfile = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!recruiterProfile || !recruiterProfile.companyId) {
    return NextResponse.json({ error: 'Please set up your company profile first.' }, { status: 400 });
  }

  const body = await request.json();
  const {
    title,
    description,
    jobType,
    location,
    ctcMin,
    ctcMax,
    deadline,
    minCGPA,
    maxBacklogs,
    allowedBranches,
    allowedBatches,
    requiredSkills,
    rounds,
  } = body;

  const drive = await prisma.drive.create({
    data: {
      title,
      description,
      jobType: jobType || 'FULL_TIME',
      location,
      ctcMin: Number(ctcMin),
      ctcMax: Number(ctcMax),
      deadline: new Date(deadline),
      companyId: recruiterProfile.companyId,
      recruiterId: recruiterProfile.id,
      status: 'LIVE',
      publishedAt: new Date(),
      eligibilityCriteria: {
        create: {
          minCGPA: Number(minCGPA || 6.0),
          maxBacklogs: Number(maxBacklogs || 0),
          allowedBranches: allowedBranches || ['CSE', 'IT', 'ECE'],
          allowedBatches: allowedBatches ? allowedBatches.map(Number) : [2024, 2025],
          requiredSkills: requiredSkills || [],
        },
      },
      rounds: {
        create: Array.isArray(rounds)
          ? rounds.map((r: { name: string; description?: string }, idx: number) => ({
              name: r.name,
              description: r.description,
              roundNumber: idx + 1,
            }))
          : [
              { name: 'Online Assessment', roundNumber: 1 },
              { name: 'Technical Interview', roundNumber: 2 },
              { name: 'HR Round', roundNumber: 3 },
            ],
      },
    },
  });

  return NextResponse.json({ success: true, drive });
}
