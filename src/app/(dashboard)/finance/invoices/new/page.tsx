import { requireSession, scopeToOwner } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import NewInvoiceForm from "@/components/NewInvoiceForm";

export default async function NewInvoicePage() {
  const session = await requireSession();
  const { role, id: userId } = session.user;
  const scope = scopeToOwner(role, userId, "ownerId");

  const cases = await prisma.case.findMany({
    where: scope,
    select: { id: true, referenceCode: true, clientName: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="New Invoice" subtitle="VAT (5%) is calculated automatically" />
      <NewInvoiceForm cases={cases} />
    </div>
  );
}
