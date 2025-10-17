import { db } from "@/lib/db";
import { AdminCheck } from "../../admin-check";
import { CategoryForm } from "../category-form";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await AdminCheck();

  const { id } = await params;

  // Fetch the category to edit
  const category = await db.category.findUnique({
    where: { id },
    include: {
      parent: true,
    },
  });

  if (!category) {
    notFound();
  }

  // Fetch all categories for parent selection (up to 3 levels)
  // Exclude current category and its children to prevent circular references
  const allChildren = await db.category.findMany({
    where: {
      OR: [
        { parentId: id },
        { parent: { parentId: id } },
      ]
    },
    select: { id: true }
  });

  const excludeIds = [id, ...allChildren.map(c => c.id)];

  const parentCategories = await db.category.findMany({
    where: {
      id: { notIn: excludeIds },
    },
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
        <h1 className="text-3xl font-bold text-white mb-2">Edit Category</h1>
        <p className="text-slate-400">
          Update category information and settings
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-8">
        <CategoryForm
          parentCategories={parentCategories}
          category={category}
          isEdit={true}
        />
      </div>
    </div>
  );
}
