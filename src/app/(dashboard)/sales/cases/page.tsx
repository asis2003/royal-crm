import { requireSession, scopeToOwner } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, Badge } from "@/components/ui";
import Link from "next/link";
import CaseStageSelect from "@/components/CaseStageSelect";
import { format } from "date-fns";

const STAGES = ["INQUIRY", "CONSULTATION", "PROPOSAL", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "REJECTED"];

export default async function CasesPage() {
  const session = await requireSession();
  const { role, id: userId } = session.user;
  const scope = scopeToOwner(role, userId, "ownerId");

  const cases = await prisma.case.findMany({
    where: scope,
    orderBy: { updatedAt: "desc" },
    include: { owner: { select: { name: true } } },
  });

  const grouped = STAGES.map((stage) => ({
    stage,
    items: cases.filter((c) => c.stage === stage),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHeader
        title="Cases / Leads"
        subtitle={role === "ADMIN" ? `${cases.length} total cases across the team` : `${cases.length} cases assigned to you`}
      />

      <div className="space-y-8">
        {grouped.map((g) => (
          <div key={g.stage}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              {g.stage.replace("_", " ")}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">{g.items.length}</span>
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {g.items.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <Link href={`/sales/cases/${c.id}`} className="text-sm font-semibold text-slate-900 hover:underline">
                        {c.clientName}
                      </Link>
                      <p className="text-xs text-slate-500">{c.referenceCode}</p>
                    </div>
                    <Badge tone="blue">{c.serviceType}</Badge>
                  </div>
                  <p className="mb-3 text-xs text-slate-500">
                    Owner: {c.owner.name}
                    {c.followUpDate && <> · Follow-up: {format(c.followUpDate, "dd MMM")}</>}
                  </p>
                  <CaseStageSelect id={c.id} stage={c.stage} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {cases.length === 0 && <p className="py-12 text-center text-slate-400">No cases yet.</p>}
      </div>
    </div>
  );
}
