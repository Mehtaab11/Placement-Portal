import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CompaniesClient, type CompanyWithDetails } from './CompaniesClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Partner Companies — TPO Admin' };

export default async function AdminCompaniesPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const rawCompanies = await prisma.company.findMany({
    include: {
      drives: {
        include: {
          eligibilityCriteria: {
            select: {
              minCGPA: true,
              maxBacklogs: true,
              allowedBranches: true,
            },
          },
          rounds: {
            orderBy: { roundNumber: 'asc' },
            select: { id: true, name: true, roundNumber: true },
          },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      recruiters: {
        include: {
          user: { select: { email: true, createdAt: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const companies: CompanyWithDetails[] = rawCompanies.map((c) => ({
    id: c.id,
    name: c.name,
    website: c.website,
    industry: c.industry,
    size: c.size,
    description: c.description,
    address: c.address,
    verified: c.verified,
    verifiedAt: c.verifiedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    drives: c.drives.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      jobType: d.jobType,
      location: d.location,
      ctcMin: d.ctcMin,
      ctcMax: d.ctcMax,
      deadline: d.deadline.toISOString(),
      description: d.description,
      eligibilityCriteria: d.eligibilityCriteria
        ? {
            minCGPA: d.eligibilityCriteria.minCGPA,
            maxBacklogs: d.eligibilityCriteria.maxBacklogs,
            allowedBranches: d.eligibilityCriteria.allowedBranches,
          }
        : null,
      rounds: d.rounds.map((r) => ({
        id: r.id,
        name: r.name,
        roundNumber: r.roundNumber,
      })),
      _count: {
        applications: d._count.applications,
      },
    })),
    recruiters: c.recruiters.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      designation: r.designation,
      user: {
        email: r.user.email,
        createdAt: r.user.createdAt.toISOString(),
      },
    })),
  }));

  return <CompaniesClient initialCompanies={companies} />;
}
