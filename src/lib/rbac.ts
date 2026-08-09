import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return session;
}

/**
 * Returns a Prisma `where` fragment that scopes a query to the
 * current user unless they are an ADMIN, in which case no scoping
 * is applied and all records are visible.
 *
 * ownerField is the name of the field on the model that holds the
 * owning user's id (e.g. "ownerId", "employeeId", "createdById").
 */
export function scopeToOwner(
  role: "ADMIN" | "USER",
  userId: string,
  ownerField: string
) {
  if (role === "ADMIN") return {};
  return { [ownerField]: userId };
}
