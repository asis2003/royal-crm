"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCallLogForm({ cases }: { cases: { id: string; referenceCode: string; clientName: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    await fetch("/api/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactName: formData.get("contactName"),
        direction: formData.get("direction"),
        durationMin: formData.get("durationMin"),
        caseId: formData.get("caseId") || null,
        notes: formData.get("notes"),
      }),
    });
    setLoading(false);
    router.refresh();
    (document.getElementById("call-form") as HTMLFormElement)?.reset();
  }

  return (
    <form id="call-form" action={submit} className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-5">
      <input name="contactName" required placeholder="Contact name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
      <select name="direction" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
        <option value="outbound">Outbound</option>
        <option value="inbound">Inbound</option>
      </select>
      <input name="durationMin" type="number" min={0} placeholder="Duration (min)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
      <select name="caseId" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
        <option value="">No linked case</option>
        {cases.map((c) => (
          <option key={c.id} value={c.id}>{c.referenceCode}</option>
        ))}
      </select>
      <input name="notes" placeholder="Notes" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
      <div className="col-span-2 md:col-span-5">
        <button type="submit" disabled={loading} className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50">
          Log Call
        </button>
      </div>
    </form>
  );
}
