import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function NotificationBell({ userId }: { userId: string }) {
  let notifications: Awaited<ReturnType<typeof prisma.notification.findMany>> = [];

  try {
    notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  } catch {
    // Neon free-tier databases suspend when idle and take a moment to wake up.
    // If this query races that wake-up, fail quietly instead of crashing the page —
    // notifications will simply show as empty until the next successful load.
    notifications = [];
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="group relative">
      <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount}
          </span>
        )}
      </button>
      <div className="invisible absolute right-0 z-10 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
        <p className="px-2 py-1 text-xs font-semibold uppercase text-slate-400">Notifications</p>
        <div className="max-h-72 overflow-y-auto">
          {notifications.map((n) => (
            <div key={n.id} className="rounded-md px-2 py-2 hover:bg-slate-50">
              <p className="text-sm font-medium text-slate-900">{n.title}</p>
              {n.body && <p className="text-xs text-slate-500">{n.body}</p>}
              <p className="mt-0.5 text-xs text-slate-400">{format(n.createdAt, "dd MMM, HH:mm")}</p>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-slate-400">No notifications</p>
          )}
        </div>
      </div>
    </div>
  );
}
