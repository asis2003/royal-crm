"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMessageForm({
  recipients,
  cases,
}: {
  recipients: { id: string; name: string }[];
  cases: { id: string; referenceCode: string; clientName: string }[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: formData.get("recipientId"),
        caseId: formData.get("caseId") || null,
        body: formData.get("body"),
      }),
    });
    setLoading(false);
    router.refresh();
    (document.getElementById("message-form") as HTMLFormElement)?.reset();
  }

  return (
    <form id="message-form" action={submit} className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <select name="recipientId" required className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Send to...</option>
          {recipients.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <select name="caseId" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">No linked case</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>{c.referenceCode} — {c.clientName}</option>
          ))}
        </select>
      </div>
      <textarea name="body" required placeholder="Write a message..." rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      <button type="submit" disabled={loading} className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50">
        Send
      </button>
    </form>
  );
}
