import { requireSession } from "@/lib/rbac";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex">
      <Sidebar userName={session.user.name ?? "User"} role={session.user.role} />
      <div className="flex-1">
        <header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-8">
          <NotificationBell userId={session.user.id} />
        </header>
        <main className="min-h-[calc(100vh-4rem)] overflow-y-auto bg-slate-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
