import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SettingsClient } from '@/components/features/Settings/SettingsClient';

export default async function RecruiterSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'RECRUITER') redirect('/login');

  return <SettingsClient user={session.user} />;
}
