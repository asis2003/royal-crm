import { loginAction } from "./actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-900 text-lg font-bold text-white">
            RM
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Royal Migration Station</h1>
          <p className="text-sm text-slate-500">Sign in to your CRM account</p>
        </div>

        <form action={loginAction as unknown as (formData: FormData) => void} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@royalmigration.com"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-900 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
          <p className="mb-1 font-medium text-slate-600">Demo accounts:</p>
          <p>Admin: admin@royalmigration.com / password123</p>
          <p>User: fatima@royalmigration.com / password123</p>
        </div>
      </div>
    </div>
  );
}