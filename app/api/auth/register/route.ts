import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password, role } = parsed.data;

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role,
        // Create a stub profile immediately so the user can fill it in
        ...(role === 'STUDENT' && {
          studentProfile: { create: {} },
        }),
        ...(role === 'RECRUITER' && {
          recruiterProfile: { create: {} },
        }),
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(
      { message: 'Account created successfully', user },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    console.error('[REGISTER]', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
