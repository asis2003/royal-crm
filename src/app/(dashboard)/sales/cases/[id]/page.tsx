import { requireSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import { format } from "date-fns";
import CaseStageSelect from "@/components/CaseStageSelect";
import { notFound } from "next/navigation";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;

  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true } },
      callLogs: { orderBy: { occurredAt: "desc" }, include: { loggedBy: { select: { name: true } } } },
      messages: { orderBy: { createdAt: "desc" }, include: { sender: { select: { name: true } } } },
      invoices: true,
    },
  });

  if (!c) notFound();

  return (
    <div>
      <PageHeader
        title={c.clientName}
        subtitle={`${c.referenceCode} · ${c.serviceType} · Owned by ${c.owner.name}`}
        action={<CaseStageSelect id={c.id} stage={c.stage} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Client Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="text-slate-900">{c.clientEmail ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Phone</dt><dd className="text-slate-900">{c.clientPhone ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Service</dt><dd className="text-slate-900">{c.serviceType}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Follow-up</dt><dd className="text-slate-900">{c.followUpDate ? format(c.followUpDate, "dd MMM yyyy") : "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Created</dt><dd className="text-slate-900">{format(c.createdAt, "dd MMM yyyy")}</dd></div>
          </dl>
          {c.notes && (
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">{c.notes}</div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Invoices</h2>
          <div className="space-y-2">
            {c.invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-md border border-slate-100 p-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{inv.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">AED {(Number(inv.amount) + Number(inv.vatAmount)).toLocaleString()}</p>
                </div>
                <Badge tone={inv.status === "PAID" ? "green" : inv.status === "OVERDUE" ? "red" : "amber"}>{inv.status}</Badge>
              </div>
            ))}
            {c.invoices.length === 0 && <p className="text-sm text-slate-400">No invoices linked to this case.</p>}
          </div>

          <h2 className="mb-3 mt-6 text-sm font-semibold text-slate-900">Call Log</h2>
          <div className="space-y-2">
            {c.callLogs.map((call) => (
              <div key={call.id} className="rounded-md border border-slate-100 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">
                    {call.direction === "inbound" ? "↙ Inbound" : "↗ Outbound"} · {call.contactName}
                  </p>
                  <span className="text-xs text-slate-400">{format(call.occurredAt, "dd MMM, HH:mm")}</span>
                </div>
                {call.notes && <p className="mt-1 text-xs text-slate-500">{call.notes}</p>}
                <p className="mt-1 text-xs text-slate-400">Logged by {call.loggedBy.name} · {call.durationMin ?? "—"} min</p>
              </div>
            ))}
            {c.callLogs.length === 0 && <p className="text-sm text-slate-400">No calls logged for this case.</p>}
          </div>

          <h2 className="mb-3 mt-6 text-sm font-semibold text-slate-900">Messages</h2>
          <div className="space-y-2">
            {c.messages.map((m) => (
              <div key={m.id} className="rounded-md border border-slate-100 p-3 text-sm">
                <p className="text-xs font-medium text-slate-700">{m.sender.name}</p>
                <p className="text-slate-600">{m.body}</p>
                <p className="mt-1 text-xs text-slate-400">{format(m.createdAt, "dd MMM, HH:mm")}</p>
              </div>
            ))}
            {c.messages.length === 0 && <p className="text-sm text-slate-400">No messages linked to this case.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
