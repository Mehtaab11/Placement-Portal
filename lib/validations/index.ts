import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['STUDENT', 'RECRUITER', 'ADMIN'], {
    required_error: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Student Profile ──────────────────────────────────────────────────────────

const BRANCHES = ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL', 'EEE', 'CHEM', 'BIOTECH', 'MBA', 'MCA'] as const;

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  address: z.string().max(500).optional(),
  linkedinUrl: z.string().url('Enter a valid LinkedIn URL').or(z.literal('')).optional(),
  githubUrl: z.string().url('Enter a valid GitHub URL').or(z.literal('')).optional(),
  portfolioUrl: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
});

export const academicInfoSchema = z.object({
  branch: z.enum(BRANCHES, { required_error: 'Branch is required' }),
  batch: z.number().int().min(2000).max(2035),
  cgpa: z.number().min(0, 'CGPA cannot be negative').max(10, 'CGPA cannot exceed 10'),
  backlogs: z.number().int().min(0, 'Backlogs cannot be negative'),
  rollNumber: z.string().min(1, 'Roll number is required').max(30),
});

export const skillsSchema = z.object({
  skills: z.array(z.string().min(1)).min(1, 'Add at least one skill'),
});

export const academicRecordSchema = z.object({
  level: z.enum(['10th', '12th', 'UG', 'PG']),
  institution: z.string().min(2).max(200),
  board: z.string().max(100).optional(),
  degree: z.string().max(200).optional(),
  fieldOfStudy: z.string().max(200).optional(),
  startYear: z.number().int().min(2000).max(2030),
  endYear: z.number().int().min(2000).max(2035),
  score: z.number().min(0).max(100),
  scoreType: z.enum(['percentage', 'cgpa']),
});

export const projectSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
  techStack: z.array(z.string()).min(1),
  liveUrl: z.string().url().or(z.literal('')).optional(),
  repoUrl: z.string().url().or(z.literal('')).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type AcademicInfoInput = z.infer<typeof academicInfoSchema>;
export type SkillsInput = z.infer<typeof skillsSchema>;
export type AcademicRecordInput = z.infer<typeof academicRecordSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;

// ─── Company ──────────────────────────────────────────────────────────────────

export const companySchema = z.object({
  name: z.string().min(2, 'Company name is required').max(200),
  website: z.string().url('Enter a valid website URL'),
  industry: z.string().min(1, 'Industry is required').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  address: z.string().max(500).optional(),
  size: z.enum(['1-50', '51-200', '201-1000', '1000+'], { required_error: 'Select company size' }),
});

export const recruiterProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/).optional().or(z.literal('')),
  designation: z.string().min(2).max(100),
});

export type CompanyInput = z.infer<typeof companySchema>;
export type RecruiterProfileInput = z.infer<typeof recruiterProfileSchema>;

// ─── Drive ───────────────────────────────────────────────────────────────────

export const driveDetailsSchema = z.object({
  title: z.string().min(3, 'Job title is required').max(200),
  description: z.string().min(50, 'Add a detailed description (min 50 chars)').max(10000),
  jobType: z.enum(['FULL_TIME', 'INTERNSHIP', 'CONTRACT']),
  location: z.string().min(2).max(200),
  isRemote: z.boolean().default(false),
  ctcMin: z.number().min(0, 'CTC cannot be negative'),
  ctcMax: z.number().min(0),
  deadline: z.string().min(1, 'Deadline is required'),
}).refine((d) => d.ctcMax >= d.ctcMin, {
  message: 'Max CTC must be ≥ Min CTC',
  path: ['ctcMax'],
});

export const eligibilityCriteriaSchema = z.object({
  minCGPA: z.number().min(0).max(10),
  maxBacklogs: z.number().int().min(0),
  allowedBranches: z.array(z.string()).min(1, 'Select at least one branch'),
  allowedBatches: z.array(z.number()).min(1, 'Select at least one batch'),
  requiredSkills: z.array(z.string()),
});

export const roundSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  roundNumber: z.number().int().min(1),
  scheduledAt: z.string().optional(),
});

export type DriveDetailsInput = z.infer<typeof driveDetailsSchema>;
export type EligibilityCriteriaInput = z.infer<typeof eligibilityCriteriaSchema>;
export type RoundInput = z.infer<typeof roundSchema>;

// ─── Application ─────────────────────────────────────────────────────────────

export const updateApplicationStageSchema = z.object({
  applicationId: z.string().cuid(),
  stage: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED']),
  notes: z.string().max(1000).optional(),
});

export type UpdateApplicationStageInput = z.infer<typeof updateApplicationStageSchema>;
