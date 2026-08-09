"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewInvoiceForm({ cases }: { cases: { id: string; referenceCode: string; clientName: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);

  async function submit(formData: FormData) {
    setLoading(true);
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: formData.get("customerName"),
        customerEmail: formData.get("customerEmail"),
        caseId: formData.get("caseId") || null,
        description: formData.get("description"),
        amount: formData.get("amount"),
        dueDate: formData.get("dueDate"),
        recurring: formData.get("recurring"),
      }),
    });
    router.push("/finance/invoices");
    router.refresh();
  }

  const vat = Math.round(amount * 0.05 * 100) / 100;

  return (
    <form action={submit} className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Customer Name</label>
          <input name="customerName" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Customer Email</label>
          <input name="customerEmail" type="email" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Linked Case (optional)</label>
        <select name="caseId" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">— No linked case —</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.referenceCode} — {c.clientName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <input name="description" required placeholder="e.g. Consulting Service Fee" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Amount (AED)</label>
          <input
            name="amount"
            type="number"
            required
            min={0}
            step="0.01"
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">VAT (5%, auto)</label>
          <input disabled value={vat.toFixed(2)} className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label>
          <input name="dueDate" type="date" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Recurring</label>
        <select name="recurring" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="NONE">One-time</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </div>

      <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
        Total (incl. VAT): <span className="font-semibold">AED {(amount + vat).toFixed(2)}</span>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50">
          Create Invoice
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600">
          Cancel
        </button>
      </div>
    </form>
  );
}
