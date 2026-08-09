import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Briefcase,
  FileText,
  CheckCircle2,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import styles from "./studentDashboard.module.css";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") redirect("/login");

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      applications: {
        include: {
          drive: { include: { company: true } },
          stageHistory: { orderBy: { changedAt: "desc" } },
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });

  const activeDrives = await prisma.drive.findMany({
    where: { status: "LIVE" },
    include: { company: true, eligibilityCriteria: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const applications = profile?.applications || [];
  const appliedCount = applications.length;
  const shortlistedCount = applications.filter(
    (a) => a.stage === "SHORTLISTED",
  ).length;
  const interviewCount = applications.filter(
    (a) => a.stage === "INTERVIEW",
  ).length;
  const offeredCount = applications.filter((a) => a.stage === "OFFERED").length;

  const completeness = profile?.completenessScore || 40;

  return (
    <div className={styles.container}>
      {/* Welcome Hero */}
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.greeting}>
            Welcome back, {profile?.fullName || "Student"}
          </h1>
          <p className={styles.subGreeting}>
            Here is what is happening with your placement applications today.
          </p>
        </div>
        <div className={styles.completenessBox}>
          <div className={styles.completenessHeader}>
            <span className={styles.completenessLabel}>
              Profile Completeness
            </span>
            <span className={styles.completenessVal}>{completeness}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${completeness}%` }}
            />
          </div>
          {completeness < 100 && (
            <Link href="/student/profile" className={styles.completeLink}>
              Complete profile to unlock all drives <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{
              background: "var(--color-primary-light)",
              color: "var(--color-primary)",
            }}
          >
            <FileText size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{appliedCount}</span>
            <span className={styles.statLabel}>Applications</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{
              background: "var(--color-warning-light)",
              color: "var(--color-warning)",
            }}
          >
            <Clock size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{shortlistedCount}</span>
            <span className={styles.statLabel}>Shortlisted</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{
              background: "var(--color-purple-light)",
              color: "var(--color-purple)",
            }}
          >
            <Sparkles size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{interviewCount}</span>
            <span className={styles.statLabel}>Interviews</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{
              background: "var(--color-success-light)",
              color: "var(--color-success)",
            }}
          >
            <Award size={20} />
          </div>
          <div className={styles.statMeta}>
            <span className={styles.statNumber}>{offeredCount}</span>
            <span className={styles.statLabel}>Offers Received</span>
          </div>
        </div>
      </div>

      {/* Main Content: Recent Applications & Active Drives */}
      <div className={styles.sectionsGrid}>
        {/* Left Column: Recent Applications */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>My Active Applications</h2>
            <Link href="/student/applications" className={styles.viewAll}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className={styles.empty}>
              <Briefcase size={32} color="var(--color-text-tertiary)" />
              <p>You haven’t applied to any drives yet.</p>
              <Link href="/student/drives" className={styles.primaryBtn}>
                Browse Placement Drives
              </Link>
            </div>
          ) : (
            <div className={styles.appList}>
              {applications.slice(0, 4).map((app) => (
                <div key={app.id} className={styles.appRow}>
                  <div className={styles.appInfo}>
                    <div className={styles.appCompanyLogo}>
                      {app.drive.company.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className={styles.appRole}>{app.drive.title}</h3>
                      <p className={styles.appCompany}>
                        {app.drive.company.name}
                      </p>
                    </div>
                  </div>

                  <div className={styles.appStatus}>
                    <span className={styles.stageBadge} data-stage={app.stage}>
                      {app.stage}
                    </span>
                    <span className={styles.recentDate}>
                      {formatDate(app.appliedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Featured Live Drives */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Featured Placement Drives</h2>
            <Link href="/student/drives" className={styles.viewAll}>
              Explore Drives <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.driveList}>
            {activeDrives.map((drive) => (
              <div key={drive.id} className={styles.driveCard}>
                <div className={styles.driveTop}>
                  <div className={styles.driveCompany}>
                    <Building2 size={16} color="var(--color-primary)" />
                    <span>{drive.company.name}</span>
                  </div>
                  <span className={styles.driveCtc}>
                    ₹{drive.ctcMin}–{drive.ctcMax} LPA
                  </span>
                </div>
                <h3 className={styles.driveTitle}>{drive.title}</h3>
                <div className={styles.driveBottom}>
                  <span className={styles.driveMeta}>
                    {drive.location} • {drive.jobType}
                  </span>
                  <Link
                    href={`/student/drives`}
                    className={styles.applySmallBtn}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
