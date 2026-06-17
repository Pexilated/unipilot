// ===========================================
// src/app/(dashboard)/layout.tsx
// Shared layout for all dashboard pages.
// Shows the sidebar on the left, content on the right.
// Server component — reads the user from Supabase on the server.
// ===========================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get the current logged-in user (server-side)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, send to login page
  if (!user) {
    redirect('/login');
  }

  // Fetch the user's profile (name, etc.)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar — fixed on the left */}
      <Sidebar user={profile} />

      {/* Main content area */}
      <main className="flex-1 ml-0 md:ml-64 min-h-screen">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
