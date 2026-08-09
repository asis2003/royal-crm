import { requireSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import { format } from "date-fns";
import Link from "next/link";

export default async function EmployeesPage() {
  const session = await requireSession();
  const { role, id: userId } = session.user;

  // RBAC: Admin sees all employees. A regular user only sees their own profile.
  const employees = await prisma.user.findMany({
    where: role === "ADMIN" ? {} : { id: userId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { ownedCases: true, leaveRequests: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={role === "ADMIN" ? `${employees.length} employees in the organization` : "Your employee profile"}
        action={
          role === "ADMIN" && (
            <Link
              href="/hr/employees/new"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Employee
            </Link>
          )
        }
      />

      <Card className="overflow-hidden !p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Job Title</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Cases</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{e.name}</p>
                  <p className="text-xs text-slate-500">{e.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{e.department ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{e.jobTitle ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {e.joiningDate ? format(e.joiningDate, "dd MMM yyyy") : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={e.role === "ADMIN" ? "purple" : "slate"}>{e.role}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{e._count.ownedCases}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
