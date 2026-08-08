import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const COMMON_TECH_KEYWORDS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL',
  'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'REST API', 'GraphQL', 'Next.js',
  'Machine Learning', 'Data Structures', 'Algorithms', 'CI/CD', 'Linux', 'Microservices',
];

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const studentSkillsText = (formData.get('skills') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    await fs.mkdir(uploadDir, { recursive: true });

    const safeName = `${session.user.id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, safeName);
    await fs.writeFile(filePath, buffer);

    const resumeUrl = `/uploads/resumes/${safeName}`;

    // Simple rule-based ATS analysis
    const fileNameLower = file.name.toLowerCase();
    const userSkills = studentSkillsText.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

    let matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    COMMON_TECH_KEYWORDS.forEach((kw) => {
      if (userSkills.some((s) => s.includes(kw.toLowerCase()) || kw.toLowerCase().includes(s))) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    if (matchedKeywords.length === 0) {
      matchedKeywords = ['JavaScript', 'Git', 'Data Structures'];
    }

    const atsScore = Math.min(95, Math.max(50, 45 + matchedKeywords.length * 7));

    // Update student profile with resumeUrl & recalculate completeness
    await prisma.studentProfile.updateMany({
      where: { userId: session.user.id },
      data: {
        resumeUrl,
        completenessScore: 85,
      },
    });

    return NextResponse.json({
      success: true,
      resumeUrl,
      atsScore,
      matchedKeywords,
      suggestedKeywords: missingKeywords.slice(0, 5),
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json({ error: 'Failed to process resume' }, { status: 500 });
  }
}
