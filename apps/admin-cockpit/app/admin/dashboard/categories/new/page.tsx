import { db } from "@/lib/db";
import { AdminCheck } from "../../admin-check";
import { CategoryForm } from "../category-form";

export default async function NewCategoryPage() {
  await AdminCheck();

  // Fetch existing categories for parent selection
  const categories = await db.category.findMany({
    where: {
      parentId: null, // Only root categories can be parents
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Add Category</h1>
        <p className="text-slate-400">
          Create a new category or subcategory for your products
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-8">
        <CategoryForm parentCategories={categories} />
      </div>
    </div>
  );
}
