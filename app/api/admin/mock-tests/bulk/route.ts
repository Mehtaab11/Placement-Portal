import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const questionSchema = z.object({
  prompt: z.string().min(1),
  options: z.array(z.string()).min(2),
  correctIndex: z.number().int().min(0),
  explanation: z.string().optional(),
  marks: z.number().int().default(1),
  section: z.string().optional(),
});

const bulkImportSchema = z.object({
  testId: z.string().min(1),
  questions: z.array(questionSchema).min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { testId, questions } = bulkImportSchema.parse(body);

    const test = await prisma.mockTest.findUnique({ where: { id: testId } });
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Insert questions
    await prisma.$transaction(
      questions.map((q, idx) =>
        prisma.mockQuestion.create({
          data: {
            testId,
            prompt: q.prompt,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation || null,
            marks: q.marks,
            section: q.section || null,
            order: idx + 1,
          },
        }),
      ),
    );

    return NextResponse.json({ ok: true, count: questions.length }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid question format', details: err.errors }, { status: 400 });
    }
    console.error('Error importing questions:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
