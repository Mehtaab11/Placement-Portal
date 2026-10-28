import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Starting Mock Test — TPO Portal' };

const DEMO_QUESTIONS = [
  {
    prompt: 'What is the worst-case time complexity of searching for an element in a Balanced Binary Search Tree (AVL / Red-Black) with N nodes?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctIndex: 1,
    explanation: 'Balanced BSTs maintain height <= O(log N), guaranteeing logarithmic time search.',
    marks: 1,
    section: 'Data Structures',
  },
  {
    prompt: 'A train running at 54 km/hr takes 20 seconds to pass a platform 150 meters long. What is the length of the train?',
    options: ['120 meters', '150 meters', '180 meters', '200 meters'],
    correctIndex: 1,
    explanation: 'Speed = 54 * (5/18) = 15 m/s. Distance = 15 * 20 = 300m. Length of train = 300 - 150 = 150m.',
    marks: 1,
    section: 'Quantitative Aptitude',
  },
  {
    prompt: 'In JavaScript / Node.js, what is the output of `console.log(typeof null)`?',
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correctIndex: 2,
    explanation: 'In JavaScript, typeof null returns "object" due to a historical legacy bug in early JS engine representations.',
    marks: 1,
    section: 'Web & Programming',
  },
  {
    prompt: 'Which of the following database isolation levels prevents phantom reads?',
    options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
    correctIndex: 3,
    explanation: 'Serializable is the highest isolation level and strictly prevents dirty reads, non-repeatable reads, and phantom reads.',
    marks: 1,
    section: 'Database Systems',
  },
  {
    prompt: 'Find the odd one out: 3, 5, 11, 14, 17, 21',
    options: ['14', '11', '17', '21'],
    correctIndex: 0,
    explanation: '14 is the only even composite number in the list.',
    marks: 1,
    section: 'Logical Reasoning',
  },
];

async function getOrCreateTest(requestedId?: string) {
  if (requestedId) {
    const existing = await prisma.mockTest.findUnique({
      where: { id: requestedId },
      include: { questions: true },
    });
    if (existing && existing.questions.length > 0) return existing;
  }

  // Find any published test with questions
  const anyTest = await prisma.mockTest.findFirst({
    where: { isPublished: true, questions: { some: {} } },
    include: { questions: true },
  });
  if (anyTest) return anyTest;

  // Otherwise, create a dummy demo package and test
  const demoPkg = await prisma.mockTestPackage.upsert({
    where: { slug: 'general-placement-aptitude-demo' },
    update: {},
    create: {
      title: 'General Placement Aptitude & Technical Sprint',
      slug: 'general-placement-aptitude-demo',
      description: 'Interactive demo test covering Data Structures, Quantitative Aptitude, Logic, and Core CS.',
      category: 'APTITUDE',
      difficulty: 'MEDIUM',
      requiredTier: null,
      isPublished: true,
      sortOrder: 1,
    },
  });

  const demoTest = await prisma.mockTest.upsert({
    where: { id: 'demo_test_interactive_01' },
    update: {},
    create: {
      id: 'demo_test_interactive_01',
      packageId: demoPkg.id,
      title: 'Interactive Placement Readiness Assessment',
      durationMinutes: 15,
      totalMarks: 5,
      negativeMarking: 0.25,
      isFreePreview: true,
      isPublished: true,
    },
  });

  for (let i = 0; i < DEMO_QUESTIONS.length; i++) {
    const q = DEMO_QUESTIONS[i];
    await prisma.mockQuestion.upsert({
      where: { id: `q_demo_${i + 1}` },
      update: {},
      create: {
        id: `q_demo_${i + 1}`,
        testId: demoTest.id,
        prompt: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        marks: q.marks,
        section: q.section,
        order: i + 1,
      },
    });
  }

  return prisma.mockTest.findUniqueOrThrow({
    where: { id: demoTest.id },
    include: { questions: true },
  });
}

export default async function StartMockTestPage({
  searchParams,
}: {
  searchParams: Promise<{ testId?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') redirect('/login');

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) redirect('/student/profile');

  const { testId } = await searchParams;
  const test = await getOrCreateTest(testId);

  // Check for existing in-progress attempt to resume
  const existingAttempt = await prisma.mockAttempt.findFirst({
    where: {
      studentId: profile.id,
      testId: test.id,
      status: 'IN_PROGRESS',
    },
    select: { id: true },
  });

  if (existingAttempt) {
    redirect(`/student/mock-tests/attempt/${existingAttempt.id}`);
  }

  // Create new attempt
  const newAttempt = await prisma.mockAttempt.create({
    data: {
      studentId: profile.id,
      testId: test.id,
      status: 'IN_PROGRESS',
      answers: {},
    },
    select: { id: true },
  });

  redirect(`/student/mock-tests/attempt/${newAttempt.id}`);
}
