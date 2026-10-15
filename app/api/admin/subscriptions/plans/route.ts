import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

const updatePlanSchema = z.object({
  id: z.string().min(1),
  pricePaise: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  features: z.record(z.string(), z.any()).optional(),
  description: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({ plans });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = updatePlanSchema.parse(body);

    const updated = await prisma.plan.update({
      where: { id },
      data,
    });

    // Invalidate cached plans catalog
    try {
      revalidateTag('plans');
    } catch {
      // ignore outside request scope
    }

    return NextResponse.json({ ok: true, plan: updated });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 });
    }
    console.error('Error updating plan:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
