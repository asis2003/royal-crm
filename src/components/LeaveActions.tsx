"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LeaveApproveReject({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function act(status: "APPROVED" | "REJECTED") {
    setLoading(true);
    await fetch("/api/leave", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        onClick={() => act("APPROVED")}
        className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        disabled={loading}
        onClick={() => act("REJECTED")}
        className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}

export function NewLeaveRequestForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    await fetch("/api/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: formData.get("type"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        reason: formData.get("reason"),
      }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
      >
        + New Leave Request
      </button>
    );
  }

  return (
    <form
      action={submit}
      className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4"
    >
      <select name="type" required className="rounded-md border border-slate-300 px-3 py-2 text-sm">
        <option value="ANNUAL">Annual</option>
        <option value="SICK">Sick</option>
        <option value="UNPAID">Unpaid</option>
        <option value="OTHER">Other</option>
      </select>
      <input type="date" name="startDate" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
      <input type="date" name="endDate" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
      <input
        type="text"
        name="reason"
        placeholder="Reason (optional)"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <div className="col-span-2 flex gap-2 md:col-span-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          Submit Request
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
