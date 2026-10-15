/**
 * Seed ONLY the subscription-related data (Plans, MockTestPackages, 
 * MockTests, MockQuestions, VideoInterviewTemplates) without touching
 * any existing placement data (users, drives, applications, etc.)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Seeding subscription data (plans, mock tests, video templates)...\n');

  // ─── Subscription Plans (Idempotent Upsert) ──────────────────────────────
  const plansData = [
    {
      id: 'plan_pro_monthly',
      slug: 'pro-monthly',
      name: 'Pro Monthly',
      tier: 'PRO' as const,
      description: 'Ideal for active job hunting. Full access to mock packages and self-practice video interviews.',
      durationDays: 30,
      pricePaise: 49900, // ₹499
      sortOrder: 1,
      features: {
        mockTestsPerMonth: 25,
        videoInterviewsPerMonth: 8,
        premiumPackages: true,
        detailedExplanations: true,
        reviewedVideoFeedback: false,
        prioritySupport: false,
      },
      isActive: true,
    },
    {
      id: 'plan_premium_monthly',
      slug: 'premium-monthly',
      name: 'Premium Monthly',
      tier: 'PREMIUM' as const,
      description: 'The ultimate placement prep suite with mentor reviewed mock video interviews.',
      durationDays: 30,
      pricePaise: 99900, // ₹999
      sortOrder: 2,
      features: {
        mockTestsPerMonth: 100,
        videoInterviewsPerMonth: 25,
        premiumPackages: true,
        detailedExplanations: true,
        reviewedVideoFeedback: true,
        prioritySupport: true,
      },
      isActive: true,
    },
    {
      id: 'plan_pro_yearly',
      slug: 'pro-yearly',
      name: 'Pro Annual (Discounted)',
      tier: 'PRO' as const,
      description: 'Comprehensive 1-year prep pack with 33% savings for pre-final & final year students.',
      durationDays: 365,
      pricePaise: 399900, // ₹3,999
      sortOrder: 3,
      features: {
        mockTestsPerMonth: 30,
        videoInterviewsPerMonth: 10,
        premiumPackages: true,
        detailedExplanations: true,
        reviewedVideoFeedback: false,
        prioritySupport: true,
      },
      isActive: true,
    },
  ];

  for (const p of plansData) {
    await prisma.plan.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log('✅ 3 Subscription Plans seeded (Pro Monthly ₹499, Premium Monthly ₹999, Pro Annual ₹3,999)');

  // ─── Mock Test Packages & Tests ───────────────────────────────────────────
  const pkg1 = await prisma.mockTestPackage.upsert({
    where: { slug: 'aptitude-foundations' },
    update: {},
    create: {
      title: 'General Aptitude & Logical Reasoning Foundations',
      slug: 'aptitude-foundations',
      description: 'Master time & work, permutations, probability, and logical syllogisms required for initial screening rounds.',
      category: 'APTITUDE',
      difficulty: 'EASY',
      requiredTier: null, // Free Preview Package
      isPublished: true,
      sortOrder: 1,
    },
  });

  const test1 = await prisma.mockTest.upsert({
    where: { id: 'test_aptitude_diag_01' },
    update: {},
    create: {
      id: 'test_aptitude_diag_01',
      packageId: pkg1.id,
      title: 'Quantitative & Speed Math Diagnostic',
      durationMinutes: 15,
      totalMarks: 10,
      negativeMarking: 0.25,
      isFreePreview: true,
      isPublished: true,
    },
  });

  const test1Questions = [
    { prompt: 'If 12 men can complete a project in 18 days, in how many days can 18 men complete the same project?', options: ['10 days', '12 days', '14 days', '16 days'], correctIndex: 1, explanation: 'M1 * D1 = M2 * D2 => 12 * 18 = 18 * D2 => D2 = 12.', marks: 1, section: 'Time & Work' },
    { prompt: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?', options: ['65 sec', '89 sec', '100 sec', '110 sec'], correctIndex: 1, explanation: 'Speed = 240/24 = 10 m/s. Total distance = 240 + 650 = 890m. Time = 890/10 = 89s.', marks: 1, section: 'Speed & Distance' },
    { prompt: 'Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both open together, how long will it take?', options: ['10 min', '12 min', '15 min', '25 min'], correctIndex: 1, explanation: 'Net rate = 1/20 + 1/30 = 5/60 = 1/12 => 12 minutes.', marks: 1, section: 'Pipes & Cisterns' },
    { prompt: 'What is the probability of getting a sum of 9 from two throws of a standard six-sided die?', options: ['1/6', '1/8', '1/9', '1/12'], correctIndex: 2, explanation: 'Favorable outcomes: (3,6), (4,5), (5,4), (6,3) = 4 outcomes out of 36 => 4/36 = 1/9.', marks: 1, section: 'Probability' },
    { prompt: 'A shopkeeper marks goods 40% above cost price and allows a 20% discount. What is the profit percentage?', options: ['12%', '15%', '18%', '20%'], correctIndex: 0, explanation: 'Let CP = 100. MP = 140. SP = 140 * 0.8 = 112 => Profit = 12%.', marks: 1, section: 'Profit & Loss' },
    { prompt: 'Find the odd one out: 3, 5, 7, 12, 17, 19', options: ['3', '7', '12', '17'], correctIndex: 2, explanation: 'All other numbers are prime; 12 is composite.', marks: 1, section: 'Number Series' },
    { prompt: 'If TODAY is coded as UQECA, what is the code for NIGHT?', options: ['OJIIU', 'OJHIU', 'OKJIU', 'OKHIU'], correctIndex: 0, explanation: '+1, +2, +3, +4, +5 pattern.', marks: 1, section: 'Coding Decoding' },
    { prompt: 'A car covers a distance at 60 km/h and returns at 40 km/h. What is the average speed for the round trip?', options: ['48 km/h', '50 km/h', '52 km/h', '54 km/h'], correctIndex: 0, explanation: 'Harmonic mean: 2 * 60 * 40 / (60 + 40) = 4800 / 100 = 48 km/h.', marks: 1, section: 'Average Speed' },
    { prompt: 'What is 35% of 180 + 18% of 350?', options: ['112', '126', '135', '144'], correctIndex: 1, explanation: '35% of 180 = 63; 18% of 350 = 63. Total = 63 + 63 = 126.', marks: 1, section: 'Percentages' },
    { prompt: 'Pointing to a photo, a man says "He is the son of the only daughter of my father". Who is in the photo?', options: ['Brother', 'Nephew / Son', 'Uncle', 'Cousin'], correctIndex: 1, explanation: 'The daughter of his father is his sister. Her son is his nephew.', marks: 1, section: 'Blood Relations' },
  ];

  for (let i = 0; i < test1Questions.length; i++) {
    const q = test1Questions[i];
    await prisma.mockQuestion.upsert({
      where: { id: `q_aptitude_${i + 1}` },
      update: {},
      create: {
        id: `q_aptitude_${i + 1}`,
        testId: test1.id,
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

  // Gated Pro Package
  const pkg2 = await prisma.mockTestPackage.upsert({
    where: { slug: 'faang-core-cs-sprint' },
    update: {},
    create: {
      title: 'Top Product Tier DSA & Core Computer Science',
      slug: 'faang-core-cs-sprint',
      description: 'Advanced data structures, time complexity analysis, DBMS transactions, and OS threading concepts.',
      category: 'TECHNICAL',
      difficulty: 'HARD',
      requiredTier: 'PRO',
      isPublished: true,
      sortOrder: 2,
    },
  });

  const test2 = await prisma.mockTest.upsert({
    where: { id: 'test_dsa_core_01' },
    update: {},
    create: {
      id: 'test_dsa_core_01',
      packageId: pkg2.id,
      title: 'Data Structures & Algorithms MCQ Sprint',
      durationMinutes: 20,
      totalMarks: 10,
      negativeMarking: 0.25,
      isFreePreview: false,
      isPublished: true,
    },
  });

  const test2Questions = [
    { prompt: 'What is the amortized time complexity of inserting n elements into a dynamic array (like std::vector or ArrayList)?', options: ['O(n^2)', 'O(n log n)', 'O(n)', 'O(1)'], correctIndex: 2, explanation: 'Total time for n insertions is O(n), giving O(1) amortized per insert.', marks: 1, section: 'Data Structures' },
    { prompt: 'Which of the following sorting algorithms is NOT stable by default?', options: ['Merge Sort', 'Insertion Sort', 'Quick Sort', 'Bubble Sort'], correctIndex: 2, explanation: 'Standard Quick Sort does not preserve relative order of equal keys.', marks: 1, section: 'Algorithms' },
    { prompt: 'In a Red-Black Tree with n nodes, what is the maximum height of the tree?', options: ['log2(n)', '2 * log2(n + 1)', 'n / 2', 'sqrt(n)'], correctIndex: 1, explanation: 'The height of a Red-Black tree is at most 2 * log2(n + 1).', marks: 1, section: 'Trees' },
    { prompt: 'Which ACID property guarantees that concurrent transactions do not interfere with each other?', options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], correctIndex: 2, explanation: 'Isolation ensures concurrent transaction execution produces equivalent serialized state.', marks: 1, section: 'DBMS' },
    { prompt: 'What condition is NOT necessary for a deadlock in an operating system?', options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'], correctIndex: 2, explanation: 'No Preemption is required for deadlock; preemption prevents deadlock.', marks: 1, section: 'Operating Systems' },
    { prompt: 'What is the time complexity to find the shortest path in an unweighted graph with V vertices and E edges using BFS?', options: ['O(V * E)', 'O(V + E)', 'O(E log V)', 'O(V^2)'], correctIndex: 1, explanation: 'BFS runs in O(V + E) time on adjacency lists.', marks: 1, section: 'Graphs' },
    { prompt: 'What data structure is typically used to implement LRU (Least Recently Used) cache with O(1) operations?', options: ['Binary Search Tree', 'Hash Map + Doubly Linked List', 'Max Heap + Array', 'Stack + Queue'], correctIndex: 1, explanation: 'Hash Map gives O(1) lookup while Doubly Linked List provides O(1) removal and insertion.', marks: 1, section: 'System Design' },
    { prompt: 'Which CPU scheduling algorithm is proven to achieve the minimum average waiting time?', options: ['First Come First Serve', 'Round Robin', 'Shortest Job First (SJF)', 'Priority Scheduling'], correctIndex: 2, explanation: 'SJF is optimal and gives minimum average waiting time for a given set of stationary processes.', marks: 1, section: 'Operating Systems' },
    { prompt: 'In TCP 3-way handshake, what is the sequence of flags exchanged?', options: ['SYN, ACK, SYN-ACK', 'SYN, SYN-ACK, ACK', 'ACK, SYN, ACK', 'FIN, ACK, FIN-ACK'], correctIndex: 1, explanation: 'Client sends SYN, server replies SYN-ACK, client sends ACK.', marks: 1, section: 'Computer Networks' },
    { prompt: 'What is the space complexity of topological sort on a Directed Acyclic Graph (DAG) with V vertices?', options: ['O(1)', 'O(log V)', 'O(V)', 'O(V^2)'], correctIndex: 2, explanation: 'Requires O(V) auxiliary space for visited array and recursion stack / queue.', marks: 1, section: 'Algorithms' },
  ];

  for (let i = 0; i < test2Questions.length; i++) {
    const q = test2Questions[i];
    await prisma.mockQuestion.upsert({
      where: { id: `q_dsa_${i + 1}` },
      update: {},
      create: {
        id: `q_dsa_${i + 1}`,
        testId: test2.id,
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
  // ─── Package 3: Verbal Ability (Free Preview) ───────────────────────────
  const pkg3 = await prisma.mockTestPackage.upsert({
    where: { slug: 'verbal-ability-foundations' },
    update: {},
    create: {
      title: 'Verbal Ability & Corporate Communication',
      slug: 'verbal-ability-foundations',
      description: 'Strengthen reading comprehension, sentence correction, vocabulary in context, and professional business English.',
      category: 'VERBAL',
      difficulty: 'MEDIUM',
      requiredTier: null, // Free Preview Package
      isPublished: true,
      sortOrder: 3,
    },
  });

  const test3 = await prisma.mockTest.upsert({
    where: { id: 'test_verbal_01' },
    update: {},
    create: {
      id: 'test_verbal_01',
      packageId: pkg3.id,
      title: 'Reading Comprehension & Verbal Accuracy',
      durationMinutes: 15,
      totalMarks: 10,
      negativeMarking: 0.25,
      isFreePreview: true,
      isPublished: true,
    },
  });

  const test3Questions = [
    { prompt: 'Choose the word nearest in meaning to "CANDID":', options: ['Secretive', 'Frank', 'Biased', 'Hesitant'], correctIndex: 1, explanation: 'Candid means truthful and straightforward; frank.', marks: 1, section: 'Synonyms' },
    { prompt: 'Identify the grammatically correct sentence:', options: ['Neither the manager nor the employees was present.', 'Neither the manager nor the employees were present.', 'Neither the manager or the employees were present.', 'Neither the manager nor the employees is present.'], correctIndex: 1, explanation: 'With "neither... nor", the verb agrees with the closer subject ("employees" -> "were").', marks: 1, section: 'Grammar' },
    { prompt: 'Choose the antonym for "EPHEMERAL":', options: ['Transient', 'Fleeting', 'Permanent', 'Short-lived'], correctIndex: 2, explanation: 'Ephemeral means lasting a very short time. Antonym is permanent.', marks: 1, section: 'Antonyms' },
    { prompt: 'Fill in the blank: "The committee agreed to _______ the recommendations after lengthy deliberations."', options: ['adapt', 'adopt', 'adept', 'adduct'], correctIndex: 1, explanation: '"Adopt" means to legally take up or follow a course of action.', marks: 1, section: 'Vocabulary' },
    { prompt: 'Select the correctly punctuated option:', options: ['Its important to double check it\'s results.', 'It\'s important to double check its results.', 'Its important to double check its results.', 'It\'s important to double check it\'s results.'], correctIndex: 1, explanation: '"It\'s" = it is. "Its" = possessive.', marks: 1, section: 'Punctuation' },
    { prompt: 'Choose the correct idiom meaning "to take on a task that is way too big":', options: ['Bite the bullet', 'Bite off more than you can chew', 'Barking up the wrong tree', 'Burn the midnight oil'], correctIndex: 1, explanation: 'Biting off more than one can chew means undertaking a commitment too large to manage.', marks: 1, section: 'Idioms' },
    { prompt: 'Change to indirect speech: She said, "I have completed the module."', options: ['She said that she had completed the module.', 'She said that she completed the module.', 'She says that she has completed the module.', 'She said that she has been completing the module.'], correctIndex: 0, explanation: 'Present perfect ("have completed") shifts to past perfect ("had completed").', marks: 1, section: 'Reported Speech' },
    { prompt: 'Select the passive voice: "The team developed a scalable algorithm."', options: ['A scalable algorithm is developed by the team.', 'A scalable algorithm was developed by the team.', 'A scalable algorithm had been developed by the team.', 'A scalable algorithm has developed by the team.'], correctIndex: 1, explanation: 'Past simple active ("developed") becomes "was developed" in passive.', marks: 1, section: 'Voice' },
    { prompt: 'Identify the misspelt word:', options: ['Accommodate', 'Privilege', 'Embarrass', 'Maintanance'], correctIndex: 3, explanation: 'The correct spelling is Maintenance.', marks: 1, section: 'Spelling' },
    { prompt: 'In a professional email, what is the best closing phrase for a job application?', options: ['Cheers,', 'Yours sincerely,', 'Later,', 'Thanks a bunch,'], correctIndex: 1, explanation: '"Yours sincerely" or "Sincerely" is the standard formal closing.', marks: 1, section: 'Business Communication' },
  ];

  for (let i = 0; i < test3Questions.length; i++) {
    const q = test3Questions[i];
    await prisma.mockQuestion.upsert({
      where: { id: `q_verbal_${i + 1}` },
      update: {},
      create: {
        id: `q_verbal_${i + 1}`,
        testId: test3.id,
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

  // ─── Package 4: Coding MCQs & Output Prediction (PRO Tier) ───────────────
  const pkg4 = await prisma.mockTestPackage.upsert({
    where: { slug: 'coding-mcq-sprint' },
    update: {},
    create: {
      title: 'Coding MCQs & Logic Tracing Sprint',
      slug: 'coding-mcq-sprint',
      description: 'Master tricky pointers, recursion trees, memory layout, and runtime output prediction in C++, Java, and Python.',
      category: 'CODING_MCQ',
      difficulty: 'MEDIUM',
      requiredTier: 'PRO',
      isPublished: true,
      sortOrder: 4,
    },
  });

  const test4 = await prisma.mockTest.upsert({
    where: { id: 'test_coding_mcq_01' },
    update: {},
    create: {
      id: 'test_coding_mcq_01',
      packageId: pkg4.id,
      title: 'C++, Java & Python Tracing Challenge',
      durationMinutes: 20,
      totalMarks: 10,
      negativeMarking: 0.25,
      isFreePreview: false,
      isPublished: true,
    },
  });

  const test4Questions = [
    { prompt: 'In C++, what is the output of: int a = 5; cout << a++ + ++a;', options: ['12', 'Undefined / Compiler Dependent', '11', '13'], correctIndex: 1, explanation: 'Modifying a variable multiple times without a sequence point causes undefined behavior in standard C++.', marks: 1, section: 'C++' },
    { prompt: 'In Python, what is the output of: print([1, 2] * 2 == [1, 2, 1, 2])?', options: ['True', 'False', 'TypeError', 'SyntaxError'], correctIndex: 0, explanation: 'List repetition multiplies the elements: [1, 2, 1, 2], and value comparison returns True.', marks: 1, section: 'Python' },
    { prompt: 'In Java, what does String s1 = "abc"; String s2 = new String("abc"); s1 == s2 evaluate to?', options: ['true', 'false', 'Compilation Error', 'NullPointerException'], correctIndex: 1, explanation: '"==" compares references. s1 points to the string pool, s2 points to heap.', marks: 1, section: 'Java' },
    { prompt: 'What is the return value of mystery(4) given: int mystery(int n) { if (n <= 1) return 1; return n * mystery(n - 1); }?', options: ['10', '16', '24', '120'], correctIndex: 2, explanation: 'This is factorial: 4! = 4 * 3 * 2 * 1 = 24.', marks: 1, section: 'Recursion' },
    { prompt: 'Which of the following creates a memory leak in C++?', options: ['delete ptr; ptr = nullptr;', 'int* p = new int[10]; delete p;', 'int* p = new int; delete p;', 'char* c = (char*)malloc(10); free(c);'], correctIndex: 1, explanation: 'Allocating with new[] requires delete[] p. Using plain delete leads to undefined behavior / leaks.', marks: 1, section: 'Memory Management' },
    { prompt: 'What will print in Python: print(type(lambda x: x))?', options: ['<class "function">', '<class "lambda">', '<class "type">', '<class "object">'], correctIndex: 0, explanation: 'Lambdas are instances of the built-in function class in Python.', marks: 1, section: 'Python' },
    { prompt: 'In Java, what happens if you don\'t override hashCode() when overriding equals()?', options: ['Compilation fails', 'HashMap lookups for equivalent keys may fail', 'Runtime NullPointerException', 'No negative side effect'], correctIndex: 1, explanation: 'The general contract requires that equal objects must have equal hash codes; failing this breaks HashSet/HashMap.', marks: 1, section: 'Java' },
    { prompt: 'What is the value of 1 << 4 in binary and decimal?', options: ['00001000 (8)', '00010000 (16)', '00100000 (32)', '00000100 (4)'], correctIndex: 1, explanation: '1 shifted left 4 times is 2^4 = 16.', marks: 1, section: 'Bit Manipulation' },
    { prompt: 'In C, what is the size of an empty struct?', options: ['0 bytes', '1 byte in C, 0 in C++', '0 bytes in C, 1 in C++', 'Undefined'], correctIndex: 2, explanation: 'In standard C, empty structs are not allowed (or 0 bytes in GNU extension), whereas in C++ an empty class/struct has size 1.', marks: 1, section: 'C Internals' },
    { prompt: 'What is the worst-case space complexity of recursion stack for QuickSort without tail call optimization?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'], correctIndex: 2, explanation: 'When the partition is completely unbalanced, recursion depth reaches O(n).', marks: 1, section: 'Complexity' },
  ];

  for (let i = 0; i < test4Questions.length; i++) {
    const q = test4Questions[i];
    await prisma.mockQuestion.upsert({
      where: { id: `q_coding_${i + 1}` },
      update: {},
      create: {
        id: `q_coding_${i + 1}`,
        testId: test4.id,
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

  // ─── Package 5: Company Specific (TCS NQT Model - Free Preview) ───────────
  const pkg5 = await prisma.mockTestPackage.upsert({
    where: { slug: 'tcs-nqt-foundation' },
    update: {},
    create: {
      title: 'TCS NQT & IT Services Foundation Mock',
      slug: 'tcs-nqt-foundation',
      description: 'Pattern-matched practice tests modeled on TCS NQT, Infosys, and Cognizant national qualifier rounds.',
      category: 'COMPANY_SPECIFIC',
      difficulty: 'EASY',
      requiredTier: null, // Free Preview Package
      isPublished: true,
      sortOrder: 5,
    },
  });

  const test5 = await prisma.mockTest.upsert({
    where: { id: 'test_tcs_nqt_01' },
    update: {},
    create: {
      id: 'test_tcs_nqt_01',
      packageId: pkg5.id,
      title: 'TCS NQT Cognitive Foundation Model Test',
      durationMinutes: 25,
      totalMarks: 10,
      negativeMarking: 0.25,
      isFreePreview: true,
      isPublished: true,
    },
  });

  const test5Questions = [
    { prompt: 'A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?', options: ['3', '4', '5', '6'], correctIndex: 2, explanation: 'CP of 6 = 1. SP of 6 = 1.20 => SP of 1 toffee = 1.20/6 = 0.20 rupee. So for 1 rupee: 1 / 0.20 = 5 toffees.', marks: 1, section: 'Numerical Ability' },
    { prompt: 'If A is the brother of B; B is the sister of C; and C is the father of D, how D is related to A?', options: ['Brother', 'Sister', 'Nephew or Niece', 'Cannot be determined'], correctIndex: 2, explanation: 'C is the brother of A. D is C\'s child, hence D is A\'s nephew or niece.', marks: 1, section: 'Reasoning Ability' },
    { prompt: 'Select the odd pair of numbers: (14, 196), (12, 144), (16, 256), (18, 320)', options: ['(14, 196)', '(12, 144)', '(16, 256)', '(18, 320)'], correctIndex: 3, explanation: 'All others are (x, x^2). 18^2 = 324, not 320.', marks: 1, section: 'Reasoning Ability' },
    { prompt: 'A sum of money at simple interest doubles in 7 years. In how many years will it become fourfold?', options: ['14 years', '21 years', '28 years', '35 years'], correctIndex: 1, explanation: 'SI for 7 years = P. To become 4P, interest needed = 3P. Time = 3 * 7 = 21 years.', marks: 1, section: 'Numerical Ability' },
    { prompt: 'Which sentence uses "affect" correctly?', options: ['The decision will have a big affect on our project.', 'The humidity affects the drying time.', 'His affectation was very sincere.', 'The new law has affected into place today.'], correctIndex: 1, explanation: '"Affect" is a verb meaning to produce an effect upon.', marks: 1, section: 'Verbal Ability' },
    { prompt: 'In an election between two candidates, one got 55% of the total valid votes. 20% of the votes were invalid. If the total number of votes was 7500, the number of valid votes that the other candidate got was:', options: ['2700', '2900', '3000', '3100'], correctIndex: 0, explanation: 'Valid votes = 80% of 7500 = 6000. Other got 45% of 6000 = 2700.', marks: 1, section: 'Numerical Ability' },
    { prompt: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?', options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'], correctIndex: 1, explanation: 'Each number is divided by 2. (1/4) / 2 = (1/8).', marks: 1, section: 'Reasoning Ability' },
    { prompt: 'Which SQL statement is used to extract data from a database?', options: ['EXTRACT', 'GET', 'SELECT', 'OPEN'], correctIndex: 2, explanation: 'SELECT is the standard DQL command.', marks: 1, section: 'Technical Assessment' },
    { prompt: 'What is the full form of SDLC in software development?', options: ['System Data Life Cycle', 'Software Development Life Cycle', 'System Design Logic Code', 'Structured Data Loading Cycle'], correctIndex: 1, explanation: 'Software Development Life Cycle.', marks: 1, section: 'Technical Assessment' },
    { prompt: 'A clock shows 3:00. What is the angle between the hour hand and minute hand?', options: ['45 degrees', '60 degrees', '90 degrees', '120 degrees'], correctIndex: 2, explanation: 'At 3:00, the minute hand is at 12 and the hour hand is at 3, making a 90-degree angle.', marks: 1, section: 'Reasoning Ability' },
  ];

  for (let i = 0; i < test5Questions.length; i++) {
    const q = test5Questions[i];
    await prisma.mockQuestion.upsert({
      where: { id: `q_tcs_${i + 1}` },
      update: {},
      create: {
        id: `q_tcs_${i + 1}`,
        testId: test5.id,
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

  console.log('✅ 5 Mock Test Packages & 50 Questions seeded across all 5 categories');

  // ─── Video Interview Templates ────────────────────────────────────────────
  await prisma.videoInterviewTemplate.upsert({
    where: { id: 'tpl_sde_behavioral_01' },
    update: {},
    create: {
      id: 'tpl_sde_behavioral_01',
      title: 'SDE Behavioral & Leadership (STAR Method)',
      domain: 'Software Engineering',
      description: 'Practice behavioral interview responses using the Situation-Task-Action-Result structure.',
      requiredTier: 'PRO',
      isPublished: true,
      questions: [
        { id: 'q_beh_1', prompt: 'Describe a challenging technical disagreement you had with a team member and how you resolved it.', thinkSeconds: 20, maxAnswerSeconds: 90 },
        { id: 'q_beh_2', prompt: 'Tell me about a time you had to deliver a software project under a tight deadline with incomplete specifications.', thinkSeconds: 20, maxAnswerSeconds: 90 },
        { id: 'q_beh_3', prompt: 'Explain a technical mistake you made in production or a past project. What did you learn?', thinkSeconds: 25, maxAnswerSeconds: 120 },
      ],
    },
  });

  await prisma.videoInterviewTemplate.upsert({
    where: { id: 'tpl_frontend_arch_02' },
    update: {},
    create: {
      id: 'tpl_frontend_arch_02',
      title: 'Frontend Architecture & Web Performance Mock',
      domain: 'Frontend Engineering',
      description: 'Simulate high-bar technical screening on Core Web Vitals, state management, and SSR vs CSR trade-offs.',
      requiredTier: 'PREMIUM',
      isPublished: true,
      questions: [
        { id: 'q_fe_1', prompt: 'How would you diagnose and optimize a slow Largest Contentful Paint (LCP) in a Next.js application?', thinkSeconds: 30, maxAnswerSeconds: 120 },
        { id: 'q_fe_2', prompt: 'Compare React Server Components with traditional Client-Side Rendering. When would you choose one?', thinkSeconds: 25, maxAnswerSeconds: 120 },
      ],
    },
  });
  console.log('✅ 2 Video Interview Templates seeded');

  // Verify
  const planCount = await prisma.plan.count();
  const pkgCount = await prisma.mockTestPackage.count();
  const tplCount = await prisma.videoInterviewTemplate.count();
  console.log(`\n🏁 Done! DB now has: ${planCount} plans, ${pkgCount} mock test packages, ${tplCount} video interview templates\n`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
