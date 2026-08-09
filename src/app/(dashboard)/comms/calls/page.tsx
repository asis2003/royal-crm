import { requireSession, scopeToOwner } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import { format } from "date-fns";
import NewCallLogForm from "@/components/NewCallLogForm";

export default async function CallsPage() {
  const session = await requireSession();
  const { role, id: userId } = session.user;
  const scope = scopeToOwner(role, userId, "loggedById");

  const [calls, cases] = await Promise.all([
    prisma.callLog.findMany({
      where: scope,
      orderBy: { occurredAt: "desc" },
      include: { loggedBy: { select: { name: true } }, case: { select: { referenceCode: true } } },
    }),
    prisma.case.findMany({ select: { id: true, referenceCode: true, clientName: true }, take: 20 }),
  ]);

  return (
    <div>
      <PageHeader title="Call Logs" subtitle={role === "ADMIN" ? "All logged calls" : "Calls you've logged"} />

      <NewCallLogForm cases={cases} />

      <Card className="overflow-hidden !p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Direction</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Case</th>
              <th className="px-4 py-3 font-medium">Logged By</th>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {calls.map((call) => (
              <tr key={call.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{call.contactName}</td>
                <td className="px-4 py-3">
                  <Badge tone={call.direction === "inbound" ? "blue" : "slate"}>{call.direction}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{call.durationMin ? `${call.durationMin} min` : "—"}</td>
                <td className="px-4 py-3 text-slate-500">{call.case?.referenceCode ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{call.loggedBy.name}</td>
                <td className="px-4 py-3 text-slate-500">{format(call.occurredAt, "dd MMM, HH:mm")}</td>
                <td className="px-4 py-3 text-slate-500">{call.notes ?? "—"}</td>
              </tr>
            ))}
            {calls.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No calls logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
