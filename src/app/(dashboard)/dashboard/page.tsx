import { requireSession, scopeToOwner } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, Card, Badge } from "@/components/ui";
import Link from "next/link";
import { format } from "date-fns";

export default async function DashboardPage() {
  const session = await requireSession();
  const { role, id: userId } = session.user;

  const caseScope = scopeToOwner(role, userId, "ownerId");
  const invoiceScope = scopeToOwner(role, userId, "createdById");
  const leaveScope = scopeToOwner(role, userId, "employeeId");

  const [
    totalCases,
    openCases,
    totalInvoiced,
    outstandingInvoices,
    pendingLeave,
    recentCases,
    employeeCount,
  ] = await Promise.all([
    prisma.case.count({ where: caseScope }),
    prisma.case.count({ where: { ...caseScope, stage: { notIn: ["COMPLETED", "REJECTED"] } } }),
    prisma.invoice.aggregate({ where: invoiceScope, _sum: { amount: true } }),
    prisma.invoice.count({ where: { ...invoiceScope, status: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.leaveRequest.count({ where: { ...leaveScope, status: "PENDING" } }),
    prisma.case.findMany({
      where: caseScope,
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { owner: { select: { name: true } } },
    }),
    role === "ADMIN" ? prisma.user.count() : Promise.resolve(null),
  ]);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${session.user.name?.split(" ")[0]}`}
        subtitle={
          role === "ADMIN"
            ? "Admin view — showing data across the whole organization"
            : "Showing your assigned cases, invoices, and requests only"
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={role === "ADMIN" ? "Total Cases" : "My Cases"} value={totalCases} tone="blue" />
        <StatCard label="Open / In Progress" value={openCases} tone="amber" />
        <StatCard
          label={role === "ADMIN" ? "Total Invoiced (AED)" : "My Invoiced (AED)"}
          value={Number(totalInvoiced._sum.amount ?? 0).toLocaleString()}
          tone="green"
        />
        <StatCard label="Outstanding Invoices" value={outstandingInvoices} tone="red" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Cases</h2>
            <Link href="/sales/cases" className="text-xs font-medium text-blue-700 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                href={`/sales/cases/${c.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{c.clientName}</p>
                  <p className="text-xs text-slate-500">
                    {c.referenceCode} · {c.serviceType} · {c.owner.name}
                  </p>
                </div>
                <StageBadge stage={c.stage} />
              </Link>
            ))}
            {recentCases.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">No cases yet.</p>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pending Leave</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{pendingLeave}</p>
            <Link href="/hr/leave" className="mt-2 inline-block text-xs font-medium text-blue-700 hover:underline">
              Review requests →
            </Link>
          </Card>
          {role === "ADMIN" && (
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Employees</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{employeeCount}</p>
              <Link href="/hr/employees" className="mt-2 inline-block text-xs font-medium text-blue-700 hover:underline">
                View employees →
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const toneMap: Record<string, "slate" | "amber" | "blue" | "green" | "red" | "purple"> = {
    INQUIRY: "slate",
    CONSULTATION: "blue",
    PROPOSAL: "purple",
    IN_PROGRESS: "amber",
    COMPLETED: "green",
    ON_HOLD: "slate",
    REJECTED: "red",
  };
  return <Badge tone={toneMap[stage] ?? "slate"}>{stage.replace("_", " ")}</Badge>;
}
