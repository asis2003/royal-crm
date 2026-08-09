import Link from "next/link";
import { signOutAction } from "@/app/(dashboard)/actions";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/sales/cases", label: "Cases / Leads", icon: "◔" },
  { href: "/finance/invoices", label: "Invoices", icon: "$" },
  { href: "/hr/employees", label: "Employees", icon: "◍" },
  { href: "/hr/leave", label: "Leave Requests", icon: "☐" },
  { href: "/comms/messages", label: "Messages", icon: "✉" },
  { href: "/comms/calls", label: "Call Logs", icon: "☏" },
];

export default function Sidebar({
  userName,
  role,
}: {
  userName: string;
  role: "ADMIN" | "USER";
}) {
  return (
    <aside className="flex h-screen w-60 flex-col justify-between border-r border-slate-200 bg-white">
      <div>
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900 text-sm font-bold text-white">
            RM
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-slate-900">Royal Migration</p>
            <p className="text-xs text-slate-500">CRM</p>
          </div>
        </div>
        <nav className="mt-3 flex flex-col gap-0.5 px-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <span className="w-4 text-center text-slate-400">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            {userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500">
              {role === "ADMIN" ? "Administrator" : "Staff"}
            </p>
          </div>
        </div>
        <form action={signOutAction}>
          <button className="w-full rounded-md border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
