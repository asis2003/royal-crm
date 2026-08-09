import { requireAdmin } from "@/lib/rbac";
import { PageHeader } from "@/components/ui";
import NewEmployeeForm from "@/components/NewEmployeeForm";

export default async function NewEmployeePage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader title="Add Employee" subtitle="Create a new account and assign their role" />
      <NewEmployeeForm />
    </div>
  );
}
