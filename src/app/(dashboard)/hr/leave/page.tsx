import { requireSession, scopeToOwner } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import { format } from "date-fns";
import { LeaveApproveReject, NewLeaveRequestForm } from "@/components/LeaveActions";

export default async function LeavePage() {
  const session = await requireSession();
  const { role, id: userId } = session.user;

  const scope = scopeToOwner(role, userId, "employeeId");

  const requests = await prisma.leaveRequest.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    include: { employee: { select: { name: true } }, approver: { select: { name: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Leave Requests"
        subtitle={role === "ADMIN" ? "All employee leave requests" : "Your leave requests"}
        action={<NewLeaveRequestForm />}
      />

      <Card className="overflow-hidden !p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              {role === "ADMIN" && <th className="px-4 py-3 font-medium">Employee</th>}
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Dates</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {role === "ADMIN" && <th className="px-4 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                {role === "ADMIN" && <td className="px-4 py-3 font-medium text-slate-900">{r.employee.name}</td>}
                <td className="px-4 py-3 text-slate-600">{r.type}</td>
                <td className="px-4 py-3 text-slate-600">
                  {format(r.startDate, "dd MMM")} – {format(r.endDate, "dd MMM yyyy")}
                </td>
                <td className="px-4 py-3 text-slate-600">{r.reason ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={r.status === "APPROVED" ? "green" : r.status === "REJECTED" ? "red" : "amber"}>
                    {r.status}
                  </Badge>
                </td>
                {role === "ADMIN" && (
                  <td className="px-4 py-3">
                    {r.status === "PENDING" ? <LeaveApproveReject id={r.id} /> : <span className="text-xs text-slate-400">—</span>}
                  </td>
                )}
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No leave requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
