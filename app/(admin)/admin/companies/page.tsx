import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Building2, Globe, CheckCircle2, ShieldCheck } from 'lucide-react';
import styles from './companies.module.css';

export default async function AdminCompaniesPage() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const companies = await prisma.company.findMany({
    include: {
      drives: true,
      recruiters: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Partner Companies & Recruiters</h1>
          <p className={styles.subtitle}>
            Onboarded hiring partners, active recruitment drives, and recruiter credentials.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {companies.map((c) => (
          <div key={c.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.logo}>{c.name.charAt(0)}</div>
              <div>
                <h2 className={styles.companyName}>{c.name}</h2>
                <span className={styles.industry}>{c.industry} • Employees: {c.size}</span>
              </div>
            </div>

            <p className={styles.desc}>{c.description}</p>

            <div className={styles.metaRow}>
              <a href={c.website} target="_blank" rel="noreferrer" className={styles.webLink}>
                <Globe size={13} /> {c.website}
              </a>
              <span className={styles.drivesCount}>
                <strong>{c.drives.length}</strong> active drives
              </span>
            </div>

            <div className={styles.footer}>
              <span className={styles.verifiedTag}>
                <ShieldCheck size={14} color="var(--color-success)" /> Verified Partner
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
