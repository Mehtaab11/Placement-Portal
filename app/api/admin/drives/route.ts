import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      industry: true,
      size: true,
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ companies });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      companyId,
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

    if (!companyId || !title || !location || !deadline) {
      return NextResponse.json(
        { error: 'Please provide company, job title, location, and application deadline.' },
        { status: 400 }
      );
    }

    // Find recruiter profile for company or first recruiter in DB
    let recruiterProfile = await prisma.recruiterProfile.findFirst({
      where: { companyId },
    });

    if (!recruiterProfile) {
      recruiterProfile = await prisma.recruiterProfile.findFirst();
    }

    if (!recruiterProfile) {
      return NextResponse.json(
        { error: 'No recruiter account found to associate with the drive. Please seed or create a recruiter.' },
        { status: 400 }
      );
    }

    const drive = await prisma.drive.create({
      data: {
        title,
        description: description || `Campus placement drive for ${title}.`,
        jobType: jobType || 'FULL_TIME',
        location,
        ctcMin: Number(ctcMin) || 0,
        ctcMax: Number(ctcMax) || Number(ctcMin) || 0,
        deadline: new Date(deadline),
        companyId,
        recruiterId: recruiterProfile.id,
        status: 'LIVE',
        publishedAt: new Date(),
        eligibilityCriteria: {
          create: {
            minCGPA: Number(minCGPA ?? 6.0),
            maxBacklogs: Number(maxBacklogs ?? 0),
            allowedBranches: allowedBranches && allowedBranches.length > 0 ? allowedBranches : ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'],
            allowedBatches: allowedBatches && allowedBatches.length > 0 ? allowedBatches.map(Number) : [2024, 2025, 2026],
            requiredSkills: requiredSkills || [],
          },
        },
        rounds: {
          create: Array.isArray(rounds) && rounds.length > 0
            ? rounds.map((r: { name: string; description?: string } | string, idx: number) => ({
                name: typeof r === 'string' ? r : r.name,
                description: typeof r === 'string' ? '' : (r.description || ''),
                roundNumber: idx + 1,
              }))
            : [
                { name: 'Online Assessment', roundNumber: 1 },
                { name: 'Technical Interview', roundNumber: 2 },
                { name: 'HR Round', roundNumber: 3 },
              ],
        },
      },
      include: {
        company: true,
        eligibilityCriteria: true,
        rounds: true,
      },
    });

    return NextResponse.json({ success: true, drive });
  } catch (err: any) {
    console.error('Error creating admin drive:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create placement drive' }, { status: 500 });
  }
}
