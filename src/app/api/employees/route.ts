import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  // Only an ADMIN may create new employee accounts.
  await requireAdmin();

  const body = await req.json();
  const { name, email, password, role, department, jobTitle, phone, joiningDate } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }

  if (role !== "ADMIN" && role !== "USER") {
    return NextResponse.json({ error: "Role must be ADMIN or USER." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An employee with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const employee = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      department: department || null,
      jobTitle: jobTitle || null,
      phone: phone || null,
      joiningDate: joiningDate ? new Date(joiningDate) : null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json(employee);
}
