import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isUserAdmin } from "@/lib/user-service";

export async function AdminCheck() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/admin/login");
  }

  const hasAdminAccess = await isUserAdmin(userId);

  if (!hasAdminAccess) {
    redirect("/admin/unauthorized");
  }

  return null;
}
