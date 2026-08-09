import { requireSession, scopeToOwner } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { InvoiceStatusSelect, DeleteInvoiceButton } from "@/components/InvoiceActions";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function money(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function InvoicesPage() {
  const session = await requireSession();
  const { role, id: userId } = session.user;
  const scope = scopeToOwner(role, userId, "createdById");

  const invoices = await prisma.invoice.findMany({
    where: scope,
    orderBy: { issuedDate: "desc" },
    include: { case: { select: { referenceCode: true } } },
  });

  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.amount) + Number(i.vatAmount), 0);
  const totalPaid = invoices
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + Number(i.amount) + Number(i.vatAmount), 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Invoices</h1>
          <p className="mt-1 text-sm text-slate-500">
            {role === "ADMIN" ? "All invoices across the organization" : "Invoices you created"}
          </p>
        </div>
        <Link
          href="/finance/invoices/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Invoice
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Total Invoiced</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">AED {money(totalInvoiced)}</p>
          <p className="mt-1 text-xs text-slate-400">{invoices.length} invoice{invoices.length !== 1 && "s"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Paid</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-emerald-600">AED {money(totalPaid)}</p>
          <p className="mt-1 text-xs text-slate-400">{invoices.filter((i) => i.status === "PAID").length} settled</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Outstanding</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-amber-600">AED {money(totalOutstanding)}</p>
          <p className="mt-1 text-xs text-slate-400">{overdueCount} overdue</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3.5">Invoice</th>
              <th className="px-6 py-3.5">Customer</th>
              <th className="px-6 py-3.5">Case</th>
              <th className="px-6 py-3.5 text-right">Amount (incl. VAT)</th>
              <th className="px-6 py-3.5">Recurring</th>
              <th className="px-6 py-3.5">Due</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="group transition hover:bg-slate-50/80">
                <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">{inv.invoiceNumber}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {initials(inv.customerName)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{inv.customerName}</p>
                      {inv.customerEmail && <p className="text-xs text-slate-400">{inv.customerEmail}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{inv.case?.referenceCode ?? "—"}</td>
                <td className="px-6 py-4 text-right font-medium tabular-nums text-slate-900">
                  {inv.currency} {money(Number(inv.amount) + Number(inv.vatAmount))}
                </td>
                <td className="px-6 py-4">
                  {inv.recurring !== "NONE" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                      </svg>
                      {inv.recurring}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-500">{format(inv.dueDate, "dd MMM yyyy")}</td>
                <td className="px-6 py-4">
                  <InvoiceStatusSelect id={inv.id} status={inv.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="opacity-0 transition group-hover:opacity-100">
                    <DeleteInvoiceButton id={inv.id} invoiceNumber={inv.invoiceNumber} />
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-slate-400">No invoices yet</p>
                  <p className="mt-1 text-xs text-slate-300">Create your first invoice to get started.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
