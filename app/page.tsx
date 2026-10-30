import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CheckCircle,
  BarChart3,
  Bell,
  Lock,
  ArrowRight,
  TrendingUp,
  Users,
  MapPin,
  Mail,
  Phone,
  Clock,
  Send,
  MessageSquare,
  Building2,
  Landmark,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import styles from "./page.module.css";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const metadata: Metadata = {
  title: "TPO Portal — Campus Placement System",
  description:
    "A simple and reliable portal for students to find placement drives, recruiters to hire talent, and colleges to manage campus placements.",
};

const FEATURES = [
  {
    icon: Bell,
    title: "Live Alerts",
    description:
      "Get instant updates when new drives open, shortlists are announced, and interview rounds are scheduled.",
    color: "#4F46E5",
  },
  {
    icon: BarChart3,
    title: "Placement Tracking",
    description:
      "View live placement stats, branch results, and hiring numbers to keep track of student job outcomes.",
    color: "#059669",
  },
  {
    icon: Lock,
    title: "Safe & Private",
    description:
      "Protected accounts and verified student profiles make sure your resume and placement data remain completely safe.",
    color: "#2563EB",
  },
];

const ROLES = [
  {
    icon: GraduationCap,
    title: "For Students",
    items: [
      "Quick profile creation and resume upload",
      "Real-time application status updates",
      "Instant alerts for shortlisted rounds",
      "Company job details and criteria guides",
    ],
    cta: "Student Login",
    href: "/login?role=STUDENT",
    color: "#4F46E5",
  },
  {
    icon: Briefcase,
    title: "For Recruiters",
    items: [
      "Post campus hiring drives with ease",
      "Filter candidates by CGPA and branch",
      "Schedule interviews and assessment rounds",
      "Issue final offers to selected students",
    ],
    cta: "Recruiter Access",
    href: "/login?role=RECRUITER",
    color: "#059669",
  },
  {
    icon: ShieldCheck,
    title: "For TPO Admins",
    items: [
      "Full oversight of all active campus drives",
      "Verify recruiter and company accounts",
      "Export placement reports and cohort stats",
      "Support students across every hiring round",
    ],
    cta: "Admin Access",
    href: "/login?role=ADMIN",
    color: "#4F46E5",
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* ─── Nav ─────────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <Image
            src="/logo.png"
            alt="TPO Logo"
            width={34}
            height={34}
            className={`${styles.navLogoImg} ${styles.logoLight}`}
            priority
          />
          <Image
            src="/logo-dark.png"
            alt="TPO Logo"
            width={34}
            height={34}
            className={`${styles.navLogoImg} ${styles.logoDark}`}
            priority
          />
          <span className={styles.navLogoText}>TPO Portal</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#showcase" className={styles.navLink}>
            Campus Cell
          </a>
          <a href="#features" className={styles.navLink}>
            Features
          </a>
          <a href="#roles" className={styles.navLink}>
            Solutions
          </a>
          <a href="#contact" className={styles.navLink}>
            Contact
          </a>
        </div>
        <div className={styles.navActions}>
          <ThemeToggle id="landing-theme-toggle" />
          <Link href="/login" className={styles.navSignIn}>
            Sign In
          </Link>
          <Link href="/register" className={styles.navCTA}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section with Visual Showcase ──────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroHeader}>
          <div className={styles.heroChip}>
            <span className={styles.chipDot} aria-hidden="true" />
            Placement Session 2026-27
          </div>
          <h1 className={styles.heroTitle}>
            The Future of
            <br />
            <span className={styles.heroAccent}>Campus Placements.</span>
          </h1>
          <p className={styles.heroDesc}>
            A unified platform connecting ambitious students, top-tier recruiters,
            and college placement administration. Streamline drives, track analytics,
            and accelerate campus careers.
          </p>
          <div className={styles.heroActions}>
            <Link
              href="/login?role=STUDENT"
              className={styles.heroBtnRole}
              id="hero-student-login"
            >
              <GraduationCap size={18} />
              Student Login
            </Link>
            <Link
              href="/login?role=RECRUITER"
              className={styles.heroBtnRole}
              id="hero-recruiter-login"
            >
              <Briefcase size={18} />
              Recruiter Access
            </Link>
            <Link
              href="/login?role=ADMIN"
              className={styles.heroBtnRole}
              id="hero-admin-login"
            >
              <ShieldCheck size={16} />
              TPO Admin
            </Link>
          </div>
        </div>

        {/* ─── Grand Visual Campus Showcase Frame ───────────────── */}
        <div className={styles.heroShowcase}>
          <div className={styles.heroShowcaseGlow} aria-hidden="true" />
          <div className={styles.heroFrame}>
            <div className={styles.heroFrameHeader}>
              <div className={styles.windowControls} aria-hidden="true">
                <span className={styles.dotRed} />
                <span className={styles.dotYellow} />
                <span className={styles.dotGreen} />
              </div>
              <div className={styles.frameAddressBar}>
                <Building2 size={13} className={styles.frameIcon} />
                <span>university.tpo.portal / campus-placement-cell</span>
              </div>
              <div className={styles.frameBadge}>
                <span className={styles.liveDot} />
                <span>Live Campus Hub</span>
              </div>
            </div>

            <div className={styles.heroImgWrapper}>
              <Image
                src="/campus-placement-cell.jpg"
                alt="University Placement Cell Campus and Students"
                width={1200}
                height={680}
                className={styles.heroImg}
                priority
              />
              <div className={styles.heroOverlay} />

              {/* Floating Glassmorphic Badges */}
              <div className={styles.tagTopLeft}>
                <div className={styles.tagIconWrapper}>
                  <Building2 size={16} />
                </div>
                <div>
                  <div className={styles.tagHeading}>University Placement Cell</div>
                  <div className={styles.tagSubtext}>Admin Block • Room 204</div>
                </div>
              </div>

              <div className={styles.tagTopRight}>
                <span className={styles.pulseGreenDot} />
                <span>Hiring Season 2026-27 Active</span>
              </div>

              <div className={styles.tagBottomLeft}>
                <div className={styles.tagNumber}>4,200+</div>
                <div className={styles.tagTextWrap}>
                  <div className={styles.tagTitle}>Registered Candidates</div>
                  <div className={styles.tagSub}>CSE • IT • ECE • MECH • CIVIL</div>
                </div>
              </div>

              <div className={styles.tagBottomRight}>
                <div className={styles.tagNumber}>150+</div>
                <div className={styles.tagTextWrap}>
                  <div className={styles.tagTitle}>Hiring Partners</div>
                  <div className={styles.tagSub}>Top Tech, Finance & Core Corporates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────────── */}
      <section
        className={styles.stats}
        id="stats"
        aria-label="Platform statistics"
      >
        <div className={styles.statItem}>
          <TrendingUp
            size={24}
            className={styles.statIcon}
            aria-hidden="true"
          />
          <span className={styles.statValue}>4,200+</span>
          <span className={styles.statLabel}>Students Registered</span>
        </div>
        <div className={styles.statDivider} aria-hidden="true" />
        <div className={styles.statItem}>
          <Users size={24} className={styles.statIcon} aria-hidden="true" />
          <span className={styles.statValue}>156</span>
          <span className={styles.statLabel}>Companies Onboarded</span>
        </div>
        <div className={styles.statDivider} aria-hidden="true" />
        <div className={styles.statItem}>
          <Briefcase size={24} className={styles.statIcon} aria-hidden="true" />
          <span className={styles.statValue}>24</span>
          <span className={styles.statLabel}>Active Drives</span>
        </div>
        <div className={styles.statDivider} aria-hidden="true" />
        <div className={styles.statItem}>
          <BarChart3 size={24} className={styles.statIcon} aria-hidden="true" />
          <span className={styles.statValue}>68%</span>
          <span className={styles.statLabel}>Placement Rate</span>
        </div>
      </section>

      {/* ─── Dedicated Campus Placement Ecosystem Showcase ───────── */}
      <section
        className={styles.showcaseSection}
        id="showcase"
        aria-label="University Placement Cell Facility"
      >
        <div className={styles.showcaseContainer}>
          <div className={styles.showcaseVisual}>
            <Image
              src="/second.png"
              alt="Students outside University Placement Cell"
              width={700}
              height={450}
              className={styles.showcaseImg}
            />
            <div className={styles.showcaseFloatingBadge}>
              <div className={styles.badgeIconBox}>
                <Landmark size={20} />
              </div>
              <div>
                <div className={styles.badgeTitle}>University Training & Placement Cell</div>
                <div className={styles.badgeSub}>Modern Infrastructure & Dedicated Interview Suites</div>
              </div>
            </div>
          </div>

          <div className={styles.showcaseContent}>
            <div className={styles.showcaseTag}>
              <Sparkles size={14} />
              <span>Campus Career Hub</span>
            </div>
            <h2 className={styles.showcaseHeading}>
              Where Academic Potential Meets Global Opportunity
            </h2>
            <p className={styles.showcaseParagraph}>
              Our state-of-the-art campus placement facility bridges the gap between students,
              placement officers, and corporate talent acquisition teams. Equipped with modern
              interview suites, online assessment labs, and direct guidance desks.
            </p>

            <div className={styles.showcasePerksList}>
              <div className={styles.showcasePerk}>
                <CheckCircle2 size={18} className={styles.perkIcon} />
                <span>Dedicated on-campus interview suites & group discussion halls</span>
              </div>
              <div className={styles.showcasePerk}>
                <CheckCircle2 size={18} className={styles.perkIcon} />
                <span>Instant resume verification and automated eligibility screening</span>
              </div>
              <div className={styles.showcasePerk}>
                <CheckCircle2 size={18} className={styles.perkIcon} />
                <span>Direct corporate collaboration with 150+ visiting industry leaders</span>
              </div>
            </div>

            <div className={styles.showcaseActions}>
              <Link href="/register" className={styles.showcasePrimaryBtn}>
                Join Campus Placement Portal <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────── */}
      <section
        className={styles.features}
        id="features"
        aria-label="Platform features"
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Everything you need in one place
          </h2>
          <p className={styles.sectionDesc}>
            Clear and easy tools that help manage campus interviews, student
            applications, and placement updates without any spreadsheet
            confusion.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={styles.featureCard}>
                <div
                  className={styles.featureIcon}
                  style={{ background: `${f.color}18`, color: f.color }}
                >
                  <Icon size={22} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Role Cards ─────────────────────────────────────────── */}
      <section
        className={styles.roles}
        id="roles"
        aria-label="Solutions by role"
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Designed for Everyone on Campus
          </h2>
          <p className={styles.sectionDesc}>
            Dedicated and simple dashboard views created specifically for
            students applying to jobs, recruiters hiring candidates, and
            placement teams.
          </p>
        </div>
        <div className={styles.rolesGrid}>
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className={styles.roleCard}>
                <div className={styles.roleIcon} style={{ color: r.color }}>
                  <Icon size={28} />
                </div>
                <h3 className={styles.roleTitle}>{r.title}</h3>
                <ul className={styles.roleList}>
                  {r.items.map((item) => (
                    <li key={item} className={styles.roleItem}>
                      <CheckCircle
                        size={14}
                        className={styles.roleCheck}
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={r.href}
                  className={styles.roleCTA}
                  style={{ color: r.color }}
                >
                  {r.cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Contact Section ────────────────────────────────────── */}
      <section
        className={styles.contact}
        id="contact"
        aria-label="Contact placement cell"
      >
        <div className={styles.sectionHeader}>
          <div className={styles.contactBadge}>
            <MessageSquare size={14} />
            <span>Get in Touch</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Contact Training & Placement Cell
          </h2>
          <p className={styles.sectionDesc}>
            Get in touch with our campus placement coordinators for drive
            inquiries, student support, and recruiter partnership assistance.
          </p>
        </div>

        <div className={styles.contactGrid}>
          <div className={styles.contactCard}>
            <div
              className={styles.contactCardIcon}
              style={{
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
              }}
            >
              <MapPin size={22} />
            </div>
            <h3 className={styles.contactCardTitle}>Placement Office</h3>
            <p className={styles.contactCardValue}>
              Room 204, Administrative Block, Main Campus
            </p>
            <p className={styles.contactCardDesc}>
              Visit our desk during working hours for walk-in guidance and
              document verification.
            </p>
          </div>

          <div className={styles.contactCard}>
            <div
              className={styles.contactCardIcon}
              style={{
                background: "var(--color-success-light)",
                color: "var(--color-success)",
              }}
            >
              <Mail size={22} />
            </div>
            <h3 className={styles.contactCardTitle}>Email Support</h3>
            <p className={styles.contactCardValue}>tpo@college.edu</p>
            <p className={styles.contactCardDesc}>
              Send us an email anytime for student queries, verification
              requests, and company scheduling.
            </p>
          </div>

          <div className={styles.contactCard}>
            <div
              className={styles.contactCardIcon}
              style={{
                background: "var(--color-info-light)",
                color: "var(--color-info)",
              }}
            >
              <Phone size={22} />
            </div>
            <h3 className={styles.contactCardTitle}>Placement Helpline</h3>
            <p className={styles.contactCardValue}>+91 (080) 2456-7890</p>
            <p className={styles.contactCardDesc}>
              Call our helpline for immediate assistance with active recruitment
              drives and student login issues.
            </p>
          </div>
        </div>

        {/* Office Timings Banner */}
        <div className={styles.hoursBanner}>
          <div className={styles.hoursLeft}>
            <Clock size={20} className={styles.hoursIcon} />
            <div>
              <span className={styles.hoursTitle}>Office Working Hours</span>
              <p className={styles.hoursText}>
                Monday to Saturday: 9:00 AM – 5:00 PM (Closed on Sundays &
                Gazetted Holidays)
              </p>
            </div>
          </div>
          <Link href="/login" className={styles.hoursBtn}>
            <Send size={15} />
            Open Portal
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          <div className={styles.footerBrandRow}>
            <Image
              src="/logo.png"
              alt="TPO Logo"
              width={26}
              height={26}
              className={`${styles.footerLogoImg} ${styles.logoLight}`}
            />
            <Image
              src="/logo-dark.png"
              alt="TPO Logo"
              width={26}
              height={26}
              className={`${styles.footerLogoImg} ${styles.logoDark}`}
            />
            <span className={styles.footerLogo}>TPO Portal</span>
          </div>
          <p className={styles.footerCopy}>
            © 2026 Placement Management System. Developed by{" "}
            <strong>Mehtab Aalam & Amit Thakur</strong>.
          </p>
        </div>
        <div className={styles.footerLinks}>
          <a href="#showcase" className={styles.footerLink}>
            Campus Cell
          </a>
          <a href="#features" className={styles.footerLink}>
            Features
          </a>
          <a href="#roles" className={styles.footerLink}>
            Solutions
          </a>
          <a href="#contact" className={styles.footerLink}>
            Contact
          </a>
          <Link href="/login" className={styles.footerLink}>
            Portal Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
