import { requireSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { format } from "date-fns";
import NewMessageForm from "@/components/NewMessageForm";

export default async function MessagesPage() {
  const session = await requireSession();
  const { role, id: userId } = session.user;

  // RBAC: Admin sees all messages org-wide. A user only sees messages
  // where they are the sender or recipient.
  const where = role === "ADMIN" ? {} : { OR: [{ senderId: userId }, { recipientId: userId }] };

  const [messages, recipients, cases] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { sender: { select: { name: true } }, recipient: { select: { name: true } }, case: { select: { referenceCode: true } } },
    }),
    prisma.user.findMany({ where: { id: { not: userId } }, select: { id: true, name: true } }),
    prisma.case.findMany({ select: { id: true, referenceCode: true, clientName: true }, take: 20 }),
  ]);

  return (
    <div>
      <PageHeader title="Messages" subtitle={role === "ADMIN" ? "All internal messages" : "Your conversations"} />

      <NewMessageForm recipients={recipients} cases={cases} />

      <div className="space-y-3">
        {messages.map((m) => (
          <Card key={m.id}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">
                {m.sender.name} <span className="text-slate-400">→</span> {m.recipient.name}
              </p>
              <span className="text-xs text-slate-400">{format(m.createdAt, "dd MMM, HH:mm")}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{m.body}</p>
            {m.case && <p className="mt-1 text-xs text-blue-700">Re: {m.case.referenceCode}</p>}
          </Card>
        ))}
        {messages.length === 0 && <p className="py-12 text-center text-slate-400">No messages yet.</p>}
      </div>
    </div>
  );
}
