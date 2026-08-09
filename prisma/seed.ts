import { PrismaClient, Role, CaseStage, InvoiceStatus, LeaveType, LeaveStatus, RecurringInterval } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // ---------- Users ----------
  const admin1 = await prisma.user.create({
    data: {
      name: "Sara Al Mansoori",
      email: "admin@royalmigration.com",
      passwordHash: password,
      role: Role.ADMIN,
      department: "Management",
      jobTitle: "General Manager",
      joiningDate: new Date("2019-03-01"),
      phone: "+971-50-100-0001",
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      name: "Omar Khalil",
      email: "admin2@royalmigration.com",
      passwordHash: password,
      role: Role.ADMIN,
      department: "Operations",
      jobTitle: "Operations Director",
      joiningDate: new Date("2019-06-15"),
      phone: "+971-50-100-0002",
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      name: "Fatima Noor",
      email: "fatima@royalmigration.com",
      passwordHash: password,
      role: Role.USER,
      department: "Sales",
      jobTitle: "Client Consultant",
      joiningDate: new Date("2022-01-10"),
      phone: "+971-50-200-0001",
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      name: "Ahmed Raza",
      email: "ahmed@royalmigration.com",
      passwordHash: password,
      role: Role.USER,
      department: "Sales",
      jobTitle: "Case Officer",
      joiningDate: new Date("2022-07-22"),
      phone: "+971-50-200-0002",
    },
  });

  const agent3 = await prisma.user.create({
    data: {
      name: "Layla Hassan",
      email: "layla@royalmigration.com",
      passwordHash: password,
      role: Role.USER,
      department: "Finance",
      jobTitle: "Accounts Executive",
      joiningDate: new Date("2023-02-01"),
      phone: "+971-50-200-0003",
    },
  });

  // ---------- Leave Requests ----------
  await prisma.leaveRequest.createMany({
    data: [
      {
        employeeId: agent1.id,
        type: LeaveType.ANNUAL,
        startDate: new Date("2026-08-20"),
        endDate: new Date("2026-08-25"),
        reason: "Family travel",
        status: LeaveStatus.PENDING,
      },
      {
        employeeId: agent2.id,
        type: LeaveType.SICK,
        startDate: new Date("2026-08-05"),
        endDate: new Date("2026-08-06"),
        reason: "Flu",
        status: LeaveStatus.APPROVED,
        approverId: admin1.id,
      },
      {
        employeeId: agent3.id,
        type: LeaveType.UNPAID,
        startDate: new Date("2026-09-01"),
        endDate: new Date("2026-09-03"),
        reason: "Personal matters",
        status: LeaveStatus.REJECTED,
        approverId: admin2.id,
      },
    ],
  });

  // ---------- Cases ----------
  const case1 = await prisma.case.create({
    data: {
      referenceCode: "RMS-2026-0001",
      clientName: "John Peterson",
      clientEmail: "john.peterson@example.com",
      clientPhone: "+44-7700-900001",
      serviceType: "Consulting Engagement",
      stage: CaseStage.IN_PROGRESS,
      ownerId: agent1.id,
      notes: "Client submitted required documents, awaiting final contract signature.",
      followUpDate: new Date("2026-08-15"),
    },
  });

  const case2 = await prisma.case.create({
    data: {
      referenceCode: "RMS-2026-0002",
      clientName: "Meera Krishnan",
      clientEmail: "meera.k@example.com",
      clientPhone: "+91-98765-43210",
      serviceType: "Business Advisory",
      stage: CaseStage.PROPOSAL,
      ownerId: agent1.id,
      notes: "Proposal submitted on Aug 1, awaiting client decision.",
      followUpDate: new Date("2026-08-20"),
    },
  });

  const case3 = await prisma.case.create({
    data: {
      referenceCode: "RMS-2026-0003",
      clientName: "Chen Wei",
      clientEmail: "chen.wei@example.com",
      clientPhone: "+86-138-0000-0000",
      serviceType: "Software Implementation",
      stage: CaseStage.CONSULTATION,
      ownerId: agent2.id,
      notes: "Initial consultation done, awaiting requirements document.",
      followUpDate: new Date("2026-08-12"),
    },
  });

  const case4 = await prisma.case.create({
    data: {
      referenceCode: "RMS-2026-0004",
      clientName: "Amara Okafor",
      clientEmail: "amara.o@example.com",
      clientPhone: "+234-802-000-0000",
      serviceType: "Consulting Engagement",
      stage: CaseStage.COMPLETED,
      ownerId: agent2.id,
      notes: "Engagement completed successfully.",
    },
  });

  const case5 = await prisma.case.create({
    data: {
      referenceCode: "RMS-2026-0005",
      clientName: "Ravi Shankar",
      clientEmail: "ravi.s@example.com",
      clientPhone: "+91-99999-88888",
      serviceType: "Support Retainer",
      stage: CaseStage.INQUIRY,
      ownerId: agent1.id,
      notes: "First contact via website form.",
      followUpDate: new Date("2026-08-11"),
    },
  });

  // ---------- Invoices ----------
  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-1001",
      customerName: "John Peterson",
      customerEmail: "john.peterson@example.com",
      caseId: case1.id,
      amount: 3500,
      vatAmount: 175,
      currency: "AED",
      status: InvoiceStatus.PENDING,
      recurring: RecurringInterval.NONE,
      dueDate: new Date("2026-08-20"),
      createdById: agent1.id,
      lineItems: {
        create: [
          { description: "Consulting Service Fee", quantity: 1, unitPrice: 3000 },
          { description: "Document Processing", quantity: 1, unitPrice: 500 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-1002",
      customerName: "Meera Krishnan",
      customerEmail: "meera.k@example.com",
      caseId: case2.id,
      amount: 4200,
      vatAmount: 210,
      currency: "AED",
      status: InvoiceStatus.PAID,
      recurring: RecurringInterval.NONE,
      dueDate: new Date("2026-07-30"),
      paidDate: new Date("2026-07-28"),
      createdById: agent1.id,
      lineItems: {
        create: [{ description: "Business Advisory Package", quantity: 1, unitPrice: 4200 }],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-1003",
      customerName: "Chen Wei",
      customerEmail: "chen.wei@example.com",
      caseId: case3.id,
      amount: 1200,
      vatAmount: 60,
      currency: "AED",
      status: InvoiceStatus.OVERDUE,
      recurring: RecurringInterval.MONTHLY,
      dueDate: new Date("2026-07-25"),
      createdById: agent2.id,
      lineItems: {
        create: [{ description: "Software Implementation Retainer", quantity: 1, unitPrice: 1200 }],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-1004",
      customerName: "Amara Okafor",
      customerEmail: "amara.o@example.com",
      caseId: case4.id,
      amount: 3000,
      vatAmount: 150,
      currency: "AED",
      status: InvoiceStatus.PAID,
      recurring: RecurringInterval.NONE,
      dueDate: new Date("2026-07-15"),
      paidDate: new Date("2026-07-14"),
      createdById: agent2.id,
      lineItems: {
        create: [{ description: "Consulting Completion Fee", quantity: 1, unitPrice: 3000 }],
      },
    },
  });

  // ---------- Call Logs ----------
  await prisma.callLog.createMany({
    data: [
      {
        loggedById: agent1.id,
        caseId: case1.id,
        contactName: "John Peterson",
        direction: "outbound",
        durationMin: 12,
        notes: "Discussed missing contract document.",
      },
      {
        loggedById: agent1.id,
        caseId: case2.id,
        contactName: "Meera Krishnan",
        direction: "inbound",
        durationMin: 5,
        notes: "Client asked about proposal status.",
      },
      {
        loggedById: agent2.id,
        caseId: case3.id,
        contactName: "Chen Wei",
        direction: "outbound",
        durationMin: 20,
        notes: "Walked through implementation requirements.",
      },
    ],
  });

  // ---------- Messages ----------
  await prisma.message.createMany({
    data: [
      {
        senderId: admin1.id,
        recipientId: agent1.id,
        caseId: case1.id,
        body: "Can you follow up with John Peterson about the contract signature?",
      },
      {
        senderId: agent1.id,
        recipientId: admin1.id,
        caseId: case1.id,
        body: "Yes, I called him today — he'll send it by Friday.",
      },
      {
        senderId: admin2.id,
        recipientId: agent2.id,
        caseId: case3.id,
        body: "Please prioritize Chen Wei's implementation requirements this week.",
      },
    ],
  });

  // ---------- Notifications ----------
  await prisma.notification.createMany({
    data: [
      { userId: agent1.id, title: "New message from Sara Al Mansoori", body: "Regarding case RMS-2026-0001" },
      { userId: agent1.id, title: "Invoice INV-2026-1002 marked as paid" },
      { userId: agent2.id, title: "New message from Omar Khalil", body: "Regarding case RMS-2026-0003" },
      { userId: agent2.id, title: "Invoice INV-2026-1003 is overdue" },
      { userId: admin1.id, title: "Leave request pending approval", body: "Fatima Noor - Annual leave" },
    ],
  });

  console.log("Seed data created successfully.");
  console.log("Login with: admin@royalmigration.com / password123 (Admin)");
  console.log("         or: fatima@royalmigration.com / password123 (User)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
