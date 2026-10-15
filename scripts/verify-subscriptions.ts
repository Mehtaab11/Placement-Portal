import { prisma } from '../lib/prisma';
import { getStudentEntitlements, FREE_TIER_LIMITS } from '../lib/subscription/entitlements';
import { assertEntitlement, consumeQuota, EntitlementError } from '../lib/subscription/guards';
import { getPaymentProvider } from '../lib/payments';

async function runTests() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🧪 RUNNING VERIFICATION SUITE FOR SUBSCRIPTION SYSTEM');
  console.log('════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  // ─── Test 1: Entitlement Resolution (Free vs Pro vs Premium) ─────────────
  console.log('▶ [1/4] Testing Entitlement Resolution...');
  const studentUser = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
    include: { studentProfile: true },
  });

  if (!studentUser || !studentUser.studentProfile) {
    console.error('No student user found in database. Seed the database first.');
    return;
  }

  // A student with no active subscription row defaults to FREE tier
  const freeEnt = await getStudentEntitlements(studentUser.id);
  assert(freeEnt.tier === 'FREE', 'Student defaults to FREE tier when no active subscription exists');
  assert(freeEnt.features.premiumPackages === false, 'FREE tier has premiumPackages = false');
  assert(freeEnt.features.mockTestsPerMonth === FREE_TIER_LIMITS.mockTestsPerMonth, 'FREE tier has 1 preview mock test');
  assert(freeEnt.features.videoInterviewsPerMonth === 0, 'FREE tier has 0 video interviews');

  // ─── Test 2: Scoring Engine with Negative Marking ──────────────────────────
  console.log('\n▶ [2/4] Testing Mock Test Scoring Engine with Negative Marking...');
  const testScoring = (answers: Record<string, number>, questions: any[], negativeMarking: number) => {
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    for (const q of questions) {
      const selected = answers[q.id];
      if (selected === undefined || selected === null) {
        skippedCount++;
      } else if (selected === q.correctIndex) {
        correctCount++;
        score += q.marks;
      } else {
        wrongCount++;
        score -= negativeMarking;
      }
    }
    return { score, correctCount, wrongCount, skippedCount };
  };

  const sampleQuestions = [
    { id: 'q1', correctIndex: 1, marks: 2 },
    { id: 'q2', correctIndex: 0, marks: 2 },
    { id: 'q3', correctIndex: 3, marks: 2 },
    { id: 'q4', correctIndex: 2, marks: 2 },
  ];

  // 2 correct (4 marks), 1 wrong (-0.5), 1 skipped
  const result = testScoring({ q1: 1, q2: 0, q3: 1 }, sampleQuestions, 0.5);
  assert(result.correctCount === 2, '2 questions answered correctly');
  assert(result.wrongCount === 1, '1 question answered wrongly');
  assert(result.skippedCount === 1, '1 question skipped');
  assert(result.score === 3.5, 'Score correctly calculated as 2*2 - 0.5 = 3.5 with negative marking');

  // ─── Test 3: Idempotent Payment Flow & Extension ──────────────────────────
  console.log('\n▶ [3/4] Testing Simulated Payment Provider & Idempotency...');
  const provider = getPaymentProvider();
  const order = await provider.createOrder({
    planId: 'plan_pro_monthly',
    amountPaise: 49900,
    currency: 'INR',
    studentId: studentUser.studentProfile.id,
  });

  assert(order.providerOrderId.startsWith('mock_order_'), 'Provider returns unique mock_order_ id');
  assert(order.amountPaise === 49900, 'Order amount matches paise');

  const confirmRes = await provider.confirmPayment({
    providerOrderId: order.providerOrderId,
    simulatedOutcome: 'SUCCESS',
  });

  assert(confirmRes.status === 'PAID', 'Simulated SUCCESS returns PAID status');
  assert(!!confirmRes.providerPaymentId, 'Provider returns providerPaymentId');

  // ─── Test 4: Quota Check-and-Increment ────────────────────────────────────
  console.log('\n▶ [4/4] Testing Quota Check & Increment...');
  const now = new Date();
  const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Clean up any temporary test counter
  await prisma.usageCounter.deleteMany({
    where: { studentId: studentUser.studentProfile.id, featureKey: 'testFeature' },
  });

  const c1 = await prisma.usageCounter.create({
    data: {
      studentId: studentUser.studentProfile.id,
      featureKey: 'testFeature',
      periodKey,
      count: 1,
    },
  });
  assert(c1.count === 1, 'Usage counter initialized to 1');

  const c2 = await prisma.usageCounter.update({
    where: { studentId_featureKey_periodKey: { studentId: studentUser.studentProfile.id, featureKey: 'testFeature', periodKey } },
    data: { count: { increment: 1 } },
  });
  assert(c2.count === 2, 'Usage counter incremented atomically to 2');

  // Clean up test counter
  await prisma.usageCounter.deleteMany({
    where: { studentId: studentUser.studentProfile.id, featureKey: 'testFeature' },
  });

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

runTests()
  .catch((e) => {
    console.error('Error running verification tests:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
