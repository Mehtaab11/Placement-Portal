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
  const recruiterProfile0 = await prisma.recruiterProfile.findUnique({ where: { userId: recruiters[0].id } });
  const recruiterProfile1 = await prisma.recruiterProfile.findUnique({ where: { userId: recruiters[1].id } });
  const recruiterProfile2 = await prisma.recruiterProfile.findUnique({ where: { userId: recruiters[2].id } });

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
