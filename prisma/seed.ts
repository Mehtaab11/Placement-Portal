import { PrismaClient, Role, DriveStatus, JobType, ApplicationStage } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TPO database...\n');

  // ─── Clean slate ──────────────────────────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.applicationStageHistory.deleteMany();
  await prisma.interviewSlot.deleteMany();
  await prisma.application.deleteMany();
  await prisma.round.deleteMany();
  await prisma.eligibilityCriteria.deleteMany();
  await prisma.drive.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workExperience.deleteMany();
  await prisma.academicRecord.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.company.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();

  const PASSWORD_HASH = await bcrypt.hash('Demo@1234', 12);

  // ─── Admin ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash: PASSWORD_HASH,
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin created');

  // ─── Companies & Recruiters ───────────────────────────────────────────────
  const companiesData = [
    { name: 'TechCorp Inc.', website: 'https://techcorp.example.com', industry: 'Technology', size: '1000+' as const },
    { name: 'FinServe Analytics', website: 'https://finserve.example.com', industry: 'Finance', size: '201-1000' as const },
    { name: 'HealthTech Systems', website: 'https://healthtech.example.com', industry: 'Healthcare', size: '201-1000' as const },
    { name: 'DataSys Corp', website: 'https://datasys.example.com', industry: 'Data & AI', size: '51-200' as const },
    { name: 'WebSolutions Ltd', website: 'https://websolutions.example.com', industry: 'Software', size: '51-200' as const },
  ];

  const companies = await Promise.all(
    companiesData.map((c) =>
      prisma.company.create({
        data: { ...c, description: `${c.name} is a leading company in the ${c.industry} industry.`, verified: true, verifiedAt: new Date() },
      }),
    ),
  );

  const recruitersData = [
    { email: 'recruiter@demo.com', name: 'Alex Johnson', designation: 'Talent Acquisition Lead', companyIndex: 0 },
    { email: 'recruiter2@demo.com', name: 'Sarah Williams', designation: 'HR Manager', companyIndex: 1 },
    { email: 'recruiter3@demo.com', name: 'Mike Chen', designation: 'Campus Recruiter', companyIndex: 2 },
  ];

  const recruiters = await Promise.all(
    recruitersData.map((r) =>
      prisma.user.create({
        data: {
          email: r.email,
          passwordHash: PASSWORD_HASH,
          role: Role.RECRUITER,
          recruiterProfile: {
            create: { fullName: r.name, designation: r.designation, companyId: companies[r.companyIndex].id },
          },
        },
        include: { recruiterProfile: true },
      }),
    ),
  );
  console.log('✅ 3 Recruiters + 5 Companies created');

  // ─── Students ─────────────────────────────────────────────────────────────
  const branches = ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'];
  const skills: Record<string, string[]> = {
    CSE:   ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'TypeScript', 'Java'],
    IT:    ['Java', 'Spring Boot', 'MySQL', 'Docker', 'AWS', 'REST APIs', 'Python'],
    ECE:   ['VLSI', 'Embedded C', 'MATLAB', 'Python', 'IoT', 'Circuit Design'],
    MECH:  ['AutoCAD', 'ANSYS', 'SolidWorks', 'Thermodynamics', 'Python'],
    CIVIL: ['AutoCAD', 'STAAD Pro', 'Project Management', 'Surveying'],
  };
  const studentNames = [
    'Aisha Patel', 'Rohan Sharma', 'Priya Singh', 'Arjun Kumar', 'Sneha Reddy',
    'Karan Mehta', 'Ananya Gupta', 'Rahul Das', 'Meera Nair', 'Vikram Joshi',
    'Pooja Agarwal', 'Siddharth Rao', 'Kavya Iyer', 'Amit Verma', 'Deepika Shah',
    'Nikhil Pandey', 'Shreya Mishra', 'Akash Dubey', 'Riya Kapoor', 'Tanuj Bose',
    'Harsha Chandra', 'Divya Sahu', 'Yash Patel', 'Nisha Roy', 'Gaurav Malhotra',
    'Simran Kaur', 'Rajat Tripathi', 'Komal Jain', 'Shubham Tiwari', 'Aditi Bansal',
    'Varun Khanna', 'Preeti Gupta', 'Rohit Nanda', 'Anjali Sethi', 'Manish Thakur',
    'Swati Dey', 'Sandeep Pillai', 'Kritika Sharma', 'Suraj Patil', 'Neha Arora',
    'Aman Singh', 'Pallavi Dixit', 'Abhinav Goel', 'Shalini Bajaj', 'Saurabh Srivastava',
    'Tanisha Yadav', 'Kunal Mathur', 'Bhavna Saxena', 'Aditya Chavan', 'student@demo.com',
  ];

  const studentUsers = [];
  for (let i = 0; i < 50; i++) {
    const branch = branches[i % branches.length];
    const batch = 2023 + (i % 3);
    const cgpa = parseFloat((6.5 + Math.random() * 3.5).toFixed(2));
    const backlogs = cgpa < 7 ? Math.floor(Math.random() * 3) : 0;
    const name = studentNames[i] ?? `Student ${i + 1}`;
    const email = i === 49 ? 'student@demo.com' : `student${i + 1}@demo.com`;
    const branchSkills = skills[branch] ?? skills.CSE;
    const selectedSkills = branchSkills.slice(0, 4 + (i % 4));

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: PASSWORD_HASH,
        role: Role.STUDENT,
        studentProfile: {
          create: {
            fullName: name,
            phone: `+91${9000000000 + i}`,
            branch,
            batch,
            cgpa,
            backlogs,
            rollNumber: `${branch}${batch}${String(i + 1).padStart(3, '0')}`,
            skills: selectedSkills,
            completenessScore: 60 + Math.floor(Math.random() * 40),
            linkedinUrl: `https://linkedin.com/in/${name.toLowerCase().replace(/\s/g, '-')}`,
            githubUrl: `https://github.com/${name.toLowerCase().split(' ')[0]}${i}`,
            academicRecords: {
              create: [
                { level: '10th', institution: 'City High School', score: 80 + Math.random() * 15, scoreType: 'percentage', startYear: 2018, endYear: 2020 },
                { level: '12th', institution: 'State Junior College', score: 75 + Math.random() * 20, scoreType: 'percentage', startYear: 2020, endYear: 2022 },
              ],
            },
          },
        },
      },
      include: { studentProfile: true },
    });
    studentUsers.push(user);
  }
  console.log('✅ 50 Students created');

  // ─── Drives ───────────────────────────────────────────────────────────────
  const recruiterProfile0 = recruiters[0].recruiterProfile;
  const recruiterProfile1 = recruiters[1].recruiterProfile;
  const recruiterProfile2 = recruiters[2].recruiterProfile;

  if (!recruiterProfile0 || !recruiterProfile1 || !recruiterProfile2) throw new Error('Recruiter profiles not found');

  const drivesData = [
    {
      title: 'Software Engineer - SDE I', companyId: companies[0].id, recruiterId: recruiterProfile0.id,
      status: DriveStatus.LIVE, jobType: JobType.FULL_TIME, location: 'Bangalore, India',
      ctcMin: 12, ctcMax: 18, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      description: 'Join TechCorp as a Software Engineer. Work on scalable systems serving millions of users.',
      eligibility: { minCGPA: 7.0, maxBacklogs: 0, allowedBranches: ['CSE', 'IT', 'ECE'], allowedBatches: [2024, 2025], requiredSkills: ['JavaScript', 'Python', 'Java'] },
      rounds: ['Online Assessment', 'Technical Round 1', 'Technical Round 2', 'HR Round'],
    },
    {
      title: 'Data Analyst', companyId: companies[1].id, recruiterId: recruiterProfile1.id,
      status: DriveStatus.LIVE, jobType: JobType.FULL_TIME, location: 'Mumbai, India',
      ctcMin: 8, ctcMax: 14, deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      description: 'FinServe Analytics is hiring data analysts to drive insights from financial data.',
      eligibility: { minCGPA: 6.5, maxBacklogs: 1, allowedBranches: ['CSE', 'IT', 'ECE', 'MECH'], allowedBatches: [2024, 2025], requiredSkills: ['Python', 'SQL', 'MATLAB'] },
      rounds: ['Aptitude Test', 'Case Study', 'HR Round'],
    },
    {
      title: 'Frontend Developer', companyId: companies[2].id, recruiterId: recruiterProfile2.id,
      status: DriveStatus.LIVE, jobType: JobType.FULL_TIME, location: 'Hyderabad, India',
      ctcMin: 10, ctcMax: 16, deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      description: 'HealthTech is looking for frontend developers to build patient-facing dashboards.',
      eligibility: { minCGPA: 6.0, maxBacklogs: 2, allowedBranches: ['CSE', 'IT'], allowedBatches: [2024, 2025], requiredSkills: ['React', 'JavaScript', 'TypeScript'] },
      rounds: ['Portfolio Review', 'Coding Challenge', 'Technical Interview', 'HR Round'],
    },
    {
      title: 'ML Engineer', companyId: companies[3].id, recruiterId: recruiterProfile0.id,
      status: DriveStatus.LIVE, jobType: JobType.FULL_TIME, location: 'Pune, India',
      ctcMin: 15, ctcMax: 22, deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      description: 'DataSys is hiring ML Engineers for building production AI pipelines.',
      eligibility: { minCGPA: 7.5, maxBacklogs: 0, allowedBranches: ['CSE', 'IT', 'ECE'], allowedBatches: [2024], requiredSkills: ['Python', 'Machine Learning', 'SQL'] },
      rounds: ['ML Assignment', 'Technical Interview', 'System Design', 'HR'],
    },
    {
      title: 'Full Stack Developer', companyId: companies[4].id, recruiterId: recruiterProfile1.id,
      status: DriveStatus.LIVE, jobType: JobType.FULL_TIME, location: 'Chennai, India',
      ctcMin: 9, ctcMax: 13, deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      description: 'WebSolutions needs full-stack developers for their growing product team.',
      eligibility: { minCGPA: 6.0, maxBacklogs: 2, allowedBranches: ['CSE', 'IT', 'ECE'], allowedBatches: [2024, 2025], requiredSkills: ['Node.js', 'React', 'MySQL'] },
      rounds: ['Coding Round', 'Technical Interview', 'HR Round'],
    },
    {
      title: 'DevOps Engineer', companyId: companies[0].id, recruiterId: recruiterProfile2.id,
      status: DriveStatus.CLOSED, jobType: JobType.FULL_TIME, location: 'Bangalore, India',
      ctcMin: 14, ctcMax: 20, deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      description: 'TechCorp DevOps drive — now closed.',
      eligibility: { minCGPA: 7.0, maxBacklogs: 0, allowedBranches: ['CSE', 'IT'], allowedBatches: [2023, 2024], requiredSkills: ['Docker', 'AWS', 'Linux'] },
      rounds: ['Technical Assessment', 'System Design', 'HR Round'],
    },
    {
      title: 'Mechanical Design Engineer', companyId: companies[2].id, recruiterId: recruiterProfile0.id,
      status: DriveStatus.LIVE, jobType: JobType.FULL_TIME, location: 'Delhi, India',
      ctcMin: 7, ctcMax: 11, deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      description: 'Design and prototype medical equipment components.',
      eligibility: { minCGPA: 6.5, maxBacklogs: 1, allowedBranches: ['MECH', 'CIVIL'], allowedBatches: [2024, 2025], requiredSkills: ['AutoCAD', 'SolidWorks', 'ANSYS'] },
      rounds: ['Design Challenge', 'Technical Interview', 'HR Round'],
    },
    {
      title: 'Cloud Infrastructure Intern', companyId: companies[3].id, recruiterId: recruiterProfile1.id,
      status: DriveStatus.DRAFT, jobType: JobType.INTERNSHIP, location: 'Remote',
      ctcMin: 3, ctcMax: 5, deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      publishedAt: null,
      description: 'Summer internship for cloud infra roles at DataSys.',
      eligibility: { minCGPA: 6.0, maxBacklogs: 2, allowedBranches: ['CSE', 'IT', 'ECE'], allowedBatches: [2025, 2026], requiredSkills: ['AWS', 'Python'] },
      rounds: ['Online Test', 'HR Round'],
    },
  ];

  const drives = [];
  for (const d of drivesData) {
    const drive = await prisma.drive.create({
      data: {
        title: d.title, companyId: d.companyId, recruiterId: d.recruiterId,
        status: d.status, jobType: d.jobType, location: d.location,
        ctcMin: d.ctcMin, ctcMax: d.ctcMax, deadline: d.deadline,
        publishedAt: d.publishedAt, description: d.description,
        isRemote: d.location === 'Remote',
        eligibilityCriteria: { create: d.eligibility },
        rounds: {
          create: d.rounds.map((name, idx) => ({ name, roundNumber: idx + 1 })),
        },
      },
    });
    drives.push(drive);
  }
  console.log('✅ 8 Drives created (5 LIVE, 1 CLOSED, 1 DRAFT + 1 INTERNSHIP DRAFT)');

  // ─── Applications ─────────────────────────────────────────────────────────
  const stages: ApplicationStage[] = [
    ApplicationStage.APPLIED,
    ApplicationStage.APPLIED,
    ApplicationStage.APPLIED,
    ApplicationStage.SHORTLISTED,
    ApplicationStage.SHORTLISTED,
    ApplicationStage.INTERVIEW,
    ApplicationStage.OFFERED,
    ApplicationStage.REJECTED,
  ];

  let appCount = 0;
  for (const studentUser of studentUsers.slice(0, 45)) {
    const profile = studentUser.studentProfile;
    if (!profile) continue;

    for (const drive of drives.filter((d) => d.status !== DriveStatus.DRAFT)) {
      // 60% chance of applying
      if (Math.random() > 0.6) continue;

      const stage = stages[Math.floor(Math.random() * stages.length)];
      const app = await prisma.application.create({
        data: {
          studentId: profile.id,
          driveId: drive.id,
          stage,
          appliedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
          stageHistory: {
            create: [
              { stage: ApplicationStage.APPLIED, changedById: admin.id },
              ...(stage !== ApplicationStage.APPLIED
                ? [{ stage, changedById: admin.id }]
                : []),
            ],
          },
        },
      });

      // Mark placed if OFFERED
      if (stage === ApplicationStage.OFFERED) {
        const company = companies.find((c) => c.id === drive.companyId);
        await prisma.studentProfile.update({
          where: { id: profile.id },
          data: { isPlaced: true, placedCompany: company?.name, placedCTC: drive.ctcMax },
        });
      }

      appCount++;
    }
  }
  console.log(`✅ ${appCount} Applications created`);

  // ─── Notifications ────────────────────────────────────────────────────────
  const notificationUsers = studentUsers.slice(0, 20);
  for (const u of notificationUsers) {
    await prisma.notification.create({
      data: {
        userId: u.id,
        type: 'DRIVE_PUBLISHED',
        title: 'New Drive Published',
        message: 'TechCorp Inc. has published a new Software Engineer drive. Check eligibility.',
        link: `/student/drives/${drives[0].id}`,
      },
    });
  }
  console.log('✅ Notifications seeded');

  // ─── Announcements ────────────────────────────────────────────────────────
  await prisma.announcement.createMany({
    data: [
      { title: 'Placement Season 2024-25 Open', content: 'The placement season is officially open. Please complete your profiles to be eligible for drives.', createdById: admin.id, targetRoles: [Role.STUDENT] },
      { title: 'Resume Submission Deadline', content: 'All students must upload their resumes by November 30th to participate in placement drives.', createdById: admin.id, targetRoles: [Role.STUDENT] },
    ],
  });

  // ─── Subscription Plans (Idempotent Upsert) ──────────────────────────────────
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
  console.log('✅ 3 Subscription Plans seeded');

  // ─── Mock Test Packages & Tests (Idempotent) ──────────────────────────────
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

  // 10 Sample Questions for Test 1
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
  console.log('✅ 2 Mock Test Packages & 20 Questions seeded');

  // ─── Video Interview Templates (Idempotent) ──────────────────────────────
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
        {
          id: 'q_beh_1',
          prompt: 'Describe a challenging technical disagreement you had with a team member or teammate and how you resolved it.',
          thinkSeconds: 20,
          maxAnswerSeconds: 90,
        },
        {
          id: 'q_beh_2',
          prompt: 'Tell me about a time you had to deliver a software project under a tight deadline with incomplete specifications.',
          thinkSeconds: 20,
          maxAnswerSeconds: 90,
        },
        {
          id: 'q_beh_3',
          prompt: 'Explain a technical mistake you made in production or a past project. What did you learn and how did you mitigate it?',
          thinkSeconds: 25,
          maxAnswerSeconds: 120,
        },
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
        {
          id: 'q_fe_1',
          prompt: 'How would you diagnose and optimize a slow Largest Contentful Paint (LCP) and Interaction to Next Paint (INP) in a Next.js application?',
          thinkSeconds: 30,
          maxAnswerSeconds: 120,
        },
        {
          id: 'q_fe_2',
          prompt: 'Compare React Server Components (RSC) with traditional Client-Side Rendering. When would you strictly choose one over the other?',
          thinkSeconds: 25,
          maxAnswerSeconds: 120,
        },
      ],
    },
  });
  console.log('✅ 2 Video Interview Templates seeded');

  console.log('\n✅ Seeding complete!');
  console.log('\n📧 Demo Login Credentials:');
  console.log('   Admin:     admin@demo.com / Demo@1234');
  console.log('   Student:   student@demo.com / Demo@1234');
  console.log('   Recruiter: recruiter@demo.com / Demo@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
