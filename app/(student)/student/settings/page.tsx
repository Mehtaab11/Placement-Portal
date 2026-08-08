import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SettingsClient } from '@/components/features/Settings/SettingsClient';

export default async function StudentSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') redirect('/login');

  return <SettingsClient user={session.user} />;
}
