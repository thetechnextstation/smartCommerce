import { db } from "@/lib/db";
import { AdminCheck } from "../../admin-check";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  await AdminCheck();

  // Fetch categories for selection
  const categories = await db.category.findMany({
    include: {
      parent: true,
    },
    orderBy: { name: "asc" },
  });

  // Fetch attribute definitions
  const attributeDefinitions = await db.attributeDefinition.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Add Product</h1>
        <p className="text-slate-400">
          Create a new product with AI-powered features
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-8">
        <ProductForm
          categories={categories}
          attributeDefinitions={attributeDefinitions}
        />
      </div>
    </div>
  );
}
