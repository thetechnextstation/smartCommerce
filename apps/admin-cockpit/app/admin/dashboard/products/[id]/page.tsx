import { db } from "@/lib/db";
import { AdminCheck } from "../../admin-check";
import { ProductForm } from "../product-form";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await AdminCheck();

  const { id } = await params;

  // Fetch the product to edit
  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: {
        orderBy: { position: "asc" },
      },
      variants: true,
      attributes: {
        include: {
          attributeDefinition: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

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
        <h1 className="text-3xl font-bold text-white mb-2">Edit Product</h1>
        <p className="text-slate-400">
          Update product information and settings
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-8">
        <ProductForm
          categories={categories}
          attributeDefinitions={attributeDefinitions}
          product={product}
          isEdit={true}
        />
      </div>
    </div>
  );
}
