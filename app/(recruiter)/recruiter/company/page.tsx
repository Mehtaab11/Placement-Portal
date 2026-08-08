import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Building2, Globe, Users } from 'lucide-react';
import styles from './company.module.css';

export default async function RecruiterCompanyPage() {
  const session = await auth();
  if (!session || session.user.role !== 'RECRUITER') redirect('/login');

  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    include: { company: true },
  });

  const company = recruiter?.company;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Company Profile</h1>
          <p className={styles.subtitle}>
            Verified organizational details visible to students across all placement drives.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.logo}>{company?.name ? company.name.charAt(0) : 'C'}</div>
          <div>
            <h2 className={styles.companyName}>{company?.name || 'Company Profile'}</h2>
            <span className={styles.industry}>{company?.industry || 'Technology'} • Employees: {company?.size || '51-200'}</span>
          </div>
        </div>

        <div className={styles.metaSection}>
          <div className={styles.metaItem}>
            <span>Official Website</span>
            <a href={company?.website || '#'} target="_blank" rel="noreferrer" className={styles.link}>
              {company?.website || 'https://example.com'}
            </a>
          </div>

          <div className={styles.metaItem}>
            <span>Recruiter Representative</span>
            <strong>{recruiter?.fullName || 'Recruiter Lead'} ({recruiter?.designation || 'TA Lead'})</strong>
          </div>
        </div>

        <div className={styles.descSection}>
          <span className={styles.descHead}>About the Organization</span>
          <p className={styles.descText}>
            {company?.description || 'Company description detailed in the verified employer directory.'}
          </p>
        </div>
      </div>
    </div>
  );
}
