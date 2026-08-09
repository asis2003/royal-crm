"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewEmployeeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");

  async function submit(formData: FormData) {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
        department: formData.get("department"),
        jobTitle: formData.get("jobTitle"),
        phone: formData.get("phone"),
        joiningDate: formData.get("joiningDate"),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    router.push("/hr/employees");
    router.refresh();
  }

  return (
    <form action={submit} className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
          <input name="name" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. Sara Ahmed" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input name="email" type="email" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="sara@company.com" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Temporary Password</label>
        <input name="password" type="password" required minLength={6} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="At least 6 characters" />
        <p className="mt-1 text-xs text-slate-400">Share this with the employee — they can log in immediately with it.</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
              role === "USER" ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="role"
              value="USER"
              checked={role === "USER"}
              onChange={() => setRole("USER")}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">Agent / Staff</p>
              <p className="mt-0.5 text-xs text-slate-500">Sees only their own cases, invoices, and requests.</p>
            </div>
          </label>
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
              role === "ADMIN" ? "border-purple-500 bg-purple-50 ring-1 ring-purple-500" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="role"
              value="ADMIN"
              checked={role === "ADMIN"}
              onChange={() => setRole("ADMIN")}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-slate-900">Admin</p>
              <p className="mt-0.5 text-xs text-slate-500">Sees and manages all data across the organization.</p>
            </div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
          <input name="department" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. Sales, Finance, HR" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Job Title</label>
          <input name="jobTitle" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. Client Consultant" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
          <input name="phone" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="+971-50-000-0000" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Joining Date</label>
          <input name="joiningDate" type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Employee"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
