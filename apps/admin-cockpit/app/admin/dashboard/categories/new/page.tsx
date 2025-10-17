import { db } from "@/lib/db";
import { AdminCheck } from "../../admin-check";
import { CategoryForm } from "../category-form";

export default async function NewCategoryPage() {
  await AdminCheck();

  // Fetch all categories for parent selection (up to 3 levels)
  // Users can select any category as parent, but the API will enforce max 3 levels
  const categories = await db.category.findMany({
    include: {
      parent: true,
    },
    orderBy: [
      { parentId: 'asc' },
      { name: 'asc' }
    ],
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Add Category</h1>
        <p className="text-slate-400">
          Create a new category or subcategory (up to 3 levels: e.g., Clothing &gt; Men &gt; Jeans)
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-8">
        <CategoryForm parentCategories={categories} />
      </div>
    </div>
  );
}
