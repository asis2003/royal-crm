"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const stages = ["INQUIRY", "CONSULTATION", "PROPOSAL", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "REJECTED"];

export default function CaseStageSelect({ id, stage }: { id: string; stage: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(newStage: string) {
    setLoading(true);
    await fetch(`/api/cases/${id}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <select
      defaultValue={stage}
      disabled={loading}
      onChange={(e) => update(e.target.value)}
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium"
    >
      {stages.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
