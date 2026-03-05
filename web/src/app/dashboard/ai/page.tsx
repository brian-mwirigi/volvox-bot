import { redirect } from 'next/navigation';

export default function DashboardAiRedirectPage() {
  redirect('/dashboard/conversations');
}
