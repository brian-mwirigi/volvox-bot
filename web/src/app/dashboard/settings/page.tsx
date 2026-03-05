import { redirect } from 'next/navigation';

export default function DashboardSettingsRedirectPage() {
  redirect('/dashboard/config');
}
