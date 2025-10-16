"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  Sparkles,
  Plus,
  Trash2,
  ImagePlus,
} from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  parent?: { name: string };
}

interface AttributeDefinition {
  id: string;
  name: string;
  slug: string;
  dataType: string;
  options: string[];
  unit: string | null;
  isRequired: boolean;
}

interface ProductFormProps {
  categories: Category[];
  attributeDefinitions: AttributeDefinition[];
  product?: any;
  isEdit?: boolean;
}

export function ProductForm({
  categories,
  attributeDefinitions,
  product,
  isEdit = false,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingSEO, setGeneratingSEO] = useState(false);
  const [skuError, setSkuError] = useState("");
  const [slugError, setSlugError] = useState("");

  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    shortDescription: product?.shortDescription || "",
    price: product?.price || "",
    compareAtPrice: product?.compareAtPrice || "",
    costPrice: product?.costPrice || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    stock: product?.stock || 0,
    lowStockThreshold: product?.lowStockThreshold || 10,
    trackInventory: product?.trackInventory ?? true,
    categoryId: product?.categoryId || "",
    brand: product?.brand || "",
    tags: product?.tags?.join(", ") || "",
    thumbnail: product?.thumbnail || "",
    metaTitle: product?.metaTitle || "",
    metaDescription: product?.metaDescription || "",
    dimensions: product?.dimensions || "",
    weight: product?.weight || "",
    color: product?.color || "",
    size: product?.size || "",
    material: product?.material || "",
    status: product?.status || "DRAFT",
    featured: product?.featured || false,
    trending: product?.trending || false,
  });

  const [images, setImages] = useState<any[]>(product?.images || []);
  const [variants, setVariants] = useState<any[]>(product?.variants || []);
  const [attributes, setAttributes] = useState<any[]>(
    product?.attributes?.map((a: any) => ({
      attributeDefinitionId: a.attributeDefinitionId,
      value: a.value,
    })) || []
  );

  // Image generation state
  const [imageGenMode, setImageGenMode] = useState<"prompt" | "composite" | "none">("none");
  const [imagePrompt, setImagePrompt] = useState("");
  const [compositeModel, setCompositeModel] = useState("");
  const [compositeObject, setCompositeObject] = useState("");
  const [compositeLocation, setCompositeLocation] = useState("");

  // Check if SKU is unique
  const checkSKUUnique = async (sku: string) => {
    if (!sku || sku.length < 3) return;

    try {
      const response = await fetch(
        `/api/products/check-unique?sku=${encodeURIComponent(sku)}${
          isEdit ? `&excludeId=${product.id}` : ""
        }`
      );
      const data = await response.json();

      if (!data.available && data.conflicts.includes("sku")) {
        setSkuError(
          `SKU "${sku}" is already used by "${data.existingProduct.name}"`
        );
      } else {
        setSkuError("");
      }
    } catch (error) {
      console.error("Error checking SKU:", error);
    }
  };

  // Check if slug is unique
  const checkSlugUnique = async (slug: string) => {
    if (!slug || slug.length < 3) return;

    try {
      const response = await fetch(
        `/api/products/check-unique?slug=${encodeURIComponent(slug)}${
          isEdit ? `&excludeId=${product.id}` : ""
        }`
      );
      const data = await response.json();

      if (!data.available && data.conflicts.includes("slug")) {
        setSlugError(
          `Slug "${slug}" is already used by "${data.existingProduct.name}"`
        );
      } else {
        setSlugError("");
      }
    } catch (error) {
      console.error("Error checking slug:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Check SKU uniqueness
    if (name === "sku") {
      checkSKUUnique(value);
    }

    // Check slug uniqueness
    if (name === "slug") {
      checkSlugUnique(value);
    }

    // Auto-generate slug from name
    if (name === "name" && !isEdit) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Auto-generate SKU from name if empty
      const sku = value
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "")
        .substring(0, 12) + "-" + Date.now().toString().slice(-4);

      setFormData((prev) => ({
        ...prev,
        slug,
        sku: formData.sku || sku // Only set SKU if it's empty
      }));

      // Check generated slug uniqueness
      checkSlugUnique(slug);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      formData.append("folder", "products");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const newImages = data.images.map((img: any, index: number) => ({
        url: img.url,
        alt: formData.name || "Product image",
        position: images.length + index,
      }));

      setImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image(s)");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.categoryId) {
      alert("Please enter product name and select category first");
      return;
    }

    setGeneratingDesc(true);
    try {
      const category = categories.find((c) => c.id === formData.categoryId);
      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: formData.name,
          category: category?.name || "Product",
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setFormData((prev) => ({ ...prev, description: data.description }));
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate description");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!formData.name || !formData.categoryId) {
      alert("Please enter product name and select category first");
      return;
    }

    setGeneratingTags(true);
    try {
      const category = categories.find((c) => c.id === formData.categoryId);
      const response = await fetch("/api/ai/generate-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: formData.name,
          description: formData.description || formData.shortDescription || formData.name,
          category: category?.name || "Product",
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setFormData((prev) => ({ ...prev, tags: data.tags.join(", ") }));
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate tags");
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    try {
      let requestBody: any = { mode: imageGenMode };

      if (imageGenMode === "prompt") {
        if (!imagePrompt) {
          alert("Please enter an image prompt");
          return;
        }
        requestBody.prompt = imagePrompt;
      } else if (imageGenMode === "composite") {
        if (!compositeModel || !compositeObject || !compositeLocation) {
          alert("Please fill in all composite fields");
          return;
        }
        requestBody.model = compositeModel;
        requestBody.object = compositeObject;
        requestBody.location = compositeLocation;
      }

      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setImages((prev) => [
        ...prev,
        {
          url: data.imageUrl,
          alt: formData.name || "AI Generated",
          position: images.length,
          aiGenerated: true,
          generationPrompt: data.generationPrompt,
          modelUsed: data.modelUsed,
        },
      ]);

      // Reset generation fields
      setImageGenMode("none");
      setImagePrompt("");
      setCompositeModel("");
      setCompositeObject("");
      setCompositeLocation("");
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate image");
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleGenerateSEO = async () => {
    if (!formData.name || !formData.categoryId) {
      alert("Please enter product name and select category first");
      return;
    }

    setGeneratingSEO(true);
    try {
      const category = categories.find((c) => c.id === formData.categoryId);
      const response = await fetch("/api/ai/generate-product-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: formData.name,
          description: formData.description || formData.shortDescription || "",
          category: category?.name || "Product",
          brand: formData.brand || "",
          price: formData.price || 0,
        }),
      });

      if (!response.ok) throw new Error("SEO generation failed");

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      }));
    } catch (error) {
      console.error("SEO generation error:", error);
      alert("Failed to generate SEO content");
    } finally {
      setGeneratingSEO(false);
    }
  };

  const [searchingSku, setSearchingSku] = useState(false);
  const [skuSearchResults, setSkuSearchResults] = useState<any[]>([]);
  const [showSkuSearch, setShowSkuSearch] = useState<number | null>(null);

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: "",
        sku: "",
        price: formData.price || 0,
        compareAtPrice: null,
        costPrice: null,
        stock: 0,
        options: {},
        isBaseProduct: false,
        baseProductId: null,
        image: null,
        images: [],
        isActive: true,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const searchProductBySku = async (query: string, variantIndex: number) => {
    if (!query || query.length < 2) {
      setSkuSearchResults([]);
      return;
    }

    setSearchingSku(true);
    try {
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(query)}&limit=10`
      );
      const data = await response.json();
      setSkuSearchResults(data.products || []);
      setShowSkuSearch(variantIndex);
    } catch (error) {
      console.error("Error searching products:", error);
    } finally {
      setSearchingSku(false);
    }
  };

  const selectBaseProduct = (variantIndex: number, product: any) => {
    updateVariant(variantIndex, "baseProductId", product.id);
    updateVariant(variantIndex, "baseProductSku", product.sku);
    updateVariant(variantIndex, "baseProductName", product.name);
    setShowSkuSearch(null);
    setSkuSearchResults([]);
  };

  const addAttribute = () => {
    if (attributeDefinitions.length === 0) {
      alert("No attribute definitions available. Create some in settings first.");
      return;
    }
    setAttributes((prev) => [
      ...prev,
      {
        attributeDefinitionId: attributeDefinitions[0].id,
        value: "",
      },
    ]);
  };

  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: string, value: any) => {
    setAttributes((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate variants
    if (variants.length > 0) {
      const invalidVariants = variants.filter(v => !v.name || !v.sku || !v.price);
      if (invalidVariants.length > 0) {
        alert("Please fill in all required fields (Name, SKU, Price) for all variants");
        return;
      }

      // Check for duplicate variant SKUs
      const variantSkus = variants.map(v => v.sku);
      const duplicateSkus = variantSkus.filter((sku, index) => variantSkus.indexOf(sku) !== index);
      if (duplicateSkus.length > 0) {
        alert(`Duplicate variant SKUs found: ${duplicateSkus.join(", ")}`);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price as any),
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice as any)
          : null,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice as any) : null,
        stock: parseInt(formData.stock as any),
        lowStockThreshold: parseInt(formData.lowStockThreshold as any),
        weight: formData.weight ? parseFloat(formData.weight as any) : null,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        images,
        variants: variants.map(v => ({
          ...v,
          price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
          compareAtPrice: v.compareAtPrice && typeof v.compareAtPrice === 'string'
            ? parseFloat(v.compareAtPrice)
            : v.compareAtPrice,
          costPrice: v.costPrice && typeof v.costPrice === 'string'
            ? parseFloat(v.costPrice)
            : v.costPrice,
          stock: typeof v.stock === 'string' ? parseInt(v.stock) : v.stock,
        })),
        attributes,
      };

      const url = isEdit ? `/api/products/${product.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save product");
      }

      router.push("/admin/dashboard/products");
      router.refresh();
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., iPhone 15 Pro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              SKU *
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 bg-slate-800/50 border ${
                skuError ? 'border-red-500' : 'border-slate-700'
              } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                skuError ? 'focus:ring-red-500' : 'focus:ring-indigo-500'
              }`}
              placeholder="e.g., IPH15PRO"
            />
            {skuError && (
              <p className="mt-1 text-sm text-red-400">{skuError}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 bg-slate-800/50 border ${
                slugError ? 'border-red-500' : 'border-slate-700'
              } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
                slugError ? 'focus:ring-red-500' : 'focus:ring-indigo-500'
              }`}
              placeholder="e.g., iphone-15-pro"
            />
            {slugError && (
              <p className="mt-1 text-sm text-red-400">{slugError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parentId ? `${cat.parent?.name} > ` : ""}
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Short Description
          </label>
          <input
            type="text"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Brief one-line description"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-300">
              Description
            </label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={generatingDesc}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm rounded-lg disabled:opacity-50 transition-all"
            >
              {generatingDesc ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generatingDesc ? "Generating..." : "AI Generate"}
            </button>
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Full product description..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Apple"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Tags
              </label>
              <button
                type="button"
                onClick={handleGenerateTags}
                disabled={generatingTags}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm rounded-lg disabled:opacity-50 transition-all"
              >
                {generatingTags ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generatingTags ? "Generating..." : "AI Generate"}
              </button>
            </div>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Price *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Compare at Price
            </label>
            <input
              type="number"
              name="compareAtPrice"
              value={formData.compareAtPrice}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cost Price
            </label>
            <input
              type="number"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Inventory</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Stock
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Low Stock Threshold
            </label>
            <input
              type="number"
              name="lowStockThreshold"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Barcode
            </label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="123456789"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="trackInventory"
            checked={formData.trackInventory}
            onChange={handleChange}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-slate-300">Track inventory for this product</span>
        </label>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Images</h2>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-40 object-cover rounded-lg border border-slate-700"
                />
                {img.aiGenerated && (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                    AI
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex gap-4">
          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            ) : (
              <Upload className="w-5 h-5 text-slate-400" />
            )}
            <span className="text-slate-300">
              {uploading ? "Uploading..." : "Upload Images"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          <button
            type="button"
            onClick={() => setImageGenMode(imageGenMode === "none" ? "prompt" : "none")}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all"
          >
            <ImagePlus className="w-5 h-5" />
            AI Generate Image
          </button>
        </div>

        {/* AI Image Generation */}
        {imageGenMode !== "none" && (
          <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">
                AI Image Generation
              </h3>
            </div>

            {/* Mode Selection */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setImageGenMode("prompt")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  imageGenMode === "prompt"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                Text Prompt
              </button>
              <button
                type="button"
                onClick={() => setImageGenMode("composite")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  imageGenMode === "composite"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                Composite
              </button>
            </div>

            {/* Prompt Mode */}
            {imageGenMode === "prompt" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Image Description
                </label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Professional product photo of a sleek smartphone on marble surface with dramatic lighting"
                />
              </div>
            )}

            {/* Composite Mode */}
            {imageGenMode === "composite" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Model/Person
                  </label>
                  <input
                    type="text"
                    value={compositeModel}
                    onChange={(e) => setCompositeModel(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Professional woman in business attire"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Object/Product
                  </label>
                  <input
                    type="text"
                    value={compositeObject}
                    onChange={(e) => setCompositeObject(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Smartwatch"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location/Setting
                  </label>
                  <input
                    type="text"
                    value={compositeLocation}
                    onChange={(e) => setCompositeLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Modern office"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={generatingImage}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg disabled:opacity-50 transition-all"
            >
              {generatingImage ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Product Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Dimensions
            </label>
            <input
              type="text"
              name="dimensions"
              value={formData.dimensions}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 146.6 x 70.6 x 8.25 mm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Weight (grams)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Color
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Titanium Blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Size
            </label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 6.1 inches"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Material
            </label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Titanium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-slate-300">Featured Product</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="trending"
              checked={formData.trending}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-slate-300">Trending</span>
          </label>
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Product Variants</h2>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
        </div>

        {variants.length > 0 && (
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">
                    Variant {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Variant Name *
                    </label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) =>
                        updateVariant(index, "name", e.target.value)
                      }
                      required
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., Medium - Blue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) =>
                        updateVariant(index, "sku", e.target.value)
                      }
                      required
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., PROD-M-BLU"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(index, "price", parseFloat(e.target.value))
                      }
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Compare at Price
                    </label>
                    <input
                      type="number"
                      value={variant.compareAtPrice || ""}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "compareAtPrice",
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      step="0.01"
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(index, "stock", parseInt(e.target.value))
                      }
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Base Product Configuration */}
                <div className="border-t border-slate-600 pt-4">
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={variant.isBaseProduct || false}
                        onChange={(e) =>
                          updateVariant(index, "isBaseProduct", e.target.checked)
                        }
                        className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-slate-300 font-medium">
                        Is Base Product
                      </span>
                    </label>
                  </div>

                  {!variant.isBaseProduct && (
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Base Product (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={variant.baseProductName || ""}
                          onChange={(e) => {
                            updateVariant(index, "baseProductName", e.target.value);
                            searchProductBySku(e.target.value, index);
                          }}
                          onFocus={() => setShowSkuSearch(index)}
                          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Search by product name or SKU..."
                        />
                        {searchingSku && showSkuSearch === index && (
                          <div className="absolute right-3 top-3">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                          </div>
                        )}
                      </div>

                      {showSkuSearch === index && skuSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                          {skuSearchResults.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => selectBaseProduct(index, product)}
                              className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-0"
                            >
                              <div className="text-white font-medium">
                                {product.name}
                              </div>
                              <div className="text-sm text-slate-400">
                                SKU: {product.sku} | Price: ${product.price}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {variant.baseProductId && (
                        <div className="mt-2 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-slate-300">
                                Selected Base Product:
                              </div>
                              <div className="text-white font-medium">
                                {variant.baseProductName}
                              </div>
                              <div className="text-sm text-slate-400">
                                SKU: {variant.baseProductSku}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                updateVariant(index, "baseProductId", null);
                                updateVariant(index, "baseProductSku", null);
                                updateVariant(index, "baseProductName", null);
                              }}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={variant.isActive !== false}
                      onChange={(e) =>
                        updateVariant(index, "isActive", e.target.checked)
                      }
                      className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-slate-300 text-sm">Active</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {variants.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No variants configured. Click "Add Variant" to create product variations.
          </div>
        )}
      </div>

      {/* Custom Attributes (Simplified - show count for now) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Custom Attributes</h2>
          <button
            type="button"
            onClick={addAttribute}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Attribute
          </button>
        </div>

        {attributes.length > 0 && (
          <div className="text-sm text-slate-400">
            {attributes.length} attribute(s) configured
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">SEO Settings</h2>
          <button
            type="button"
            onClick={handleGenerateSEO}
            disabled={generatingSEO || !formData.name || !formData.categoryId}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm rounded-lg disabled:opacity-50 transition-all"
          >
            {generatingSEO ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generatingSEO ? "Generating..." : "AI Generate SEO"}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Meta Title
          </label>
          <input
            type="text"
            name="metaTitle"
            value={formData.metaTitle}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="SEO title for search engines"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Meta Description
          </label>
          <textarea
            name="metaDescription"
            value={formData.metaDescription}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="SEO description for search engines"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-6 border-t border-slate-700">
        <Link
          href="/admin/dashboard/products"
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
