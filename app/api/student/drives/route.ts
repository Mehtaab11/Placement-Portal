import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get student profile to evaluate eligibility
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  const drives = await prisma.drive.findMany({
    where: { status: { in: ['LIVE', 'CLOSED'] } },
    include: {
      company: true,
      eligibilityCriteria: true,
      rounds: { orderBy: { roundNumber: 'asc' } },
      applications: {
        where: profile ? { studentId: profile.id } : undefined,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate dynamic eligibility per drive
  const enrichedDrives = drives.map((d) => {
    const hasApplied = (d.applications && d.applications.length > 0) || false;
    const userApp = hasApplied ? d.applications[0] : null;
    const crit = d.eligibilityCriteria;

    let isEligible = true;
    const reasons: string[] = [];

    if (!profile) {
      isEligible = false;
      reasons.push('Please complete your student profile first.');
    } else if (crit) {
      if (profile.cgpa < crit.minCGPA) {
        isEligible = false;
        reasons.push(`Minimum CGPA requirement is ${crit.minCGPA} (Your CGPA: ${profile.cgpa})`);
      }
      if (profile.backlogs > crit.maxBacklogs) {
        isEligible = false;
        reasons.push(`Maximum ${crit.maxBacklogs} backlogs allowed (You have: ${profile.backlogs})`);
      }
      if (crit.allowedBranches.length > 0 && !crit.allowedBranches.includes(profile.branch)) {
        isEligible = false;
        reasons.push(`Allowed branches: ${crit.allowedBranches.join(', ')} (Your branch: ${profile.branch})`);
      }
      if (crit.allowedBatches.length > 0 && !crit.allowedBatches.includes(profile.batch)) {
        isEligible = false;
        reasons.push(`Allowed batches: ${crit.allowedBatches.join(', ')} (Your batch: ${profile.batch})`);
      }
    }

    return {
      ...d,
      isEligible,
      eligibilityReasons: reasons,
      hasApplied,
      applicationStage: userApp?.stage ?? null,
      appliedAt: userApp?.appliedAt ?? null,
    };
  });

  return NextResponse.json({ drives: enrichedDrives, profile });
}
