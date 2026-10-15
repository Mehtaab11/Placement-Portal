import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createPackageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(''),
  category: z.enum(['APTITUDE', 'TECHNICAL', 'VERBAL', 'CODING_MCQ', 'COMPANY_SPECIFIC']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  requiredTier: z.enum(['PRO', 'PREMIUM']).nullable().optional(),
  isPublished: z.boolean().default(false),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const packages = await prisma.mockTestPackage.findMany({
    include: {
      tests: {
        include: {
          _count: { select: { questions: true, attempts: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ packages });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createPackageSchema.parse(body);

    const pkg = await prisma.mockTestPackage.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        requiredTier: data.requiredTier,
        isPublished: data.isPublished,
      },
    });

    return NextResponse.json({ ok: true, package: pkg }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    console.error('Error creating package:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, isPublished, ...rest } = body;

    const updated = await prisma.mockTestPackage.update({
      where: { id },
      data: {
        ...(typeof isPublished === 'boolean' ? { isPublished } : {}),
        ...rest,
      },
    });

    return NextResponse.json({ ok: true, package: updated });
  } catch (err: unknown) {
    console.error('Error updating package:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
