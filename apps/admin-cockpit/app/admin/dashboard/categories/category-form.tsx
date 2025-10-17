"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Upload, Sparkles, ImagePlus } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFormProps {
  parentCategories: Category[];
  category?: any;
  isEdit?: boolean;
}

export function CategoryForm({ parentCategories, category, isEdit = false }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingSEO, setGeneratingSEO] = useState(false);

  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    image: category?.image || "",
    parentId: category?.parentId || "",
    metaTitle: category?.metaTitle || "",
    metaDescription: category?.metaDescription || "",
    keywords: category?.keywords?.join(", ") || "",
    position: category?.position || 0,
    isActive: category?.isActive ?? true,
    isFeatured: category?.isFeatured || false,
    icon: category?.icon || "",
  });

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

    // Auto-generate slug from name
    if (name === "name" && !isEdit) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", "categories");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setFormData((prev) => ({ ...prev, image: data.images[0].url }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!formData.name) {
      alert("Please enter a category name first");
      return;
    }

    setGeneratingContent(true);
    try {
      const parentCategory = parentCategories.find((c) => c.id === formData.parentId);

      const response = await fetch("/api/ai/generate-category-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName: formData.name,
          isSubcategory: !!formData.parentId,
          parentCategoryName: parentCategory?.name || "",
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        description: data.description,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords.join(", "),
      }));
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate content");
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!formData.name) {
      alert("Please enter a category name first");
      return;
    }

    setGeneratingImage(true);
    try {
      const parentCategory = parentCategories.find((c) => c.id === formData.parentId);

      const response = await fetch("/api/ai/generate-category-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName: formData.name,
          description: formData.description,
          isSubcategory: !!formData.parentId,
          parentCategoryName: parentCategory?.name || "",
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setFormData((prev) => ({ ...prev, image: data.imageUrl }));
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate image");
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleGenerateSEO = async () => {
    if (!formData.name) {
      alert("Please enter a category name first");
      return;
    }

    setGeneratingSEO(true);
    try {
      const parentCategory = parentCategories.find((c) => c.id === formData.parentId);

      const response = await fetch("/api/ai/generate-category-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName: formData.name,
          isSubcategory: !!formData.parentId,
          parentCategoryName: parentCategory?.name || "",
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords.join(", "),
      }));
    } catch (error) {
      console.error("SEO generation error:", error);
      alert("Failed to generate SEO content");
    } finally {
      setGeneratingSEO(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        parentId: formData.parentId || null,
      };

      const url = isEdit ? `/api/categories/${category.id}` : "/api/categories";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save category");
      }

      router.push("/admin/dashboard/categories");
      router.refresh();
    } catch (error: any) {
      console.error("Save error:", error);
      alert(error.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Basic Information</h2>
          <button
            type="button"
            onClick={handleGenerateContent}
            disabled={generatingContent || !formData.name}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm rounded-lg disabled:opacity-50 transition-all"
          >
            {generatingContent ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generatingContent ? "Generating..." : "AI Generate All"}
          </button>
        </div>
        <p className="text-sm text-slate-400">
          Generate description and SEO content automatically using AI
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Electronics"
            />
          </div>

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
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., electronics"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Category description..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Parent Category
            </label>
            <select
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">None (Root Category - Level 1)</option>
              {parentCategories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Supports up to 3 levels (e.g., Clothing &gt; Men &gt; Jeans)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Icon (Emoji)
            </label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 📱 or ⚡"
            />
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Image</h2>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Category Image
          </label>
          <div className="flex items-start gap-4">
            {formData.image && (
              <img
                src={formData.image}
                alt="Category"
                className="w-32 h-32 object-cover rounded-lg border border-slate-700"
              />
            )}
            <div className="flex-1 space-y-2">
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                ) : (
                  <Upload className="w-5 h-5 text-slate-400" />
                )}
                <span className="text-slate-300">
                  {uploading ? "Uploading..." : "Upload Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={generatingImage || !formData.name}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg disabled:opacity-50 transition-all"
              >
                {generatingImage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ImagePlus className="w-5 h-5" />
                )}
                <span className="text-slate-300">
                  {generatingImage ? "Generating..." : "AI Generate Image"}
                </span>
              </button>

              <p className="text-xs text-slate-500">
                Recommended: 800x800px, JPG or PNG
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">SEO Settings</h2>
          <button
            type="button"
            onClick={handleGenerateSEO}
            disabled={generatingSEO || !formData.name}
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
        <p className="text-sm text-slate-400">
          Generate meta title, description, and keywords automatically using AI
        </p>

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

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Keywords
          </label>
          <input
            type="text"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="text-xs text-slate-500 mt-1">
            Separate keywords with commas
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Position
            </label>
            <input
              type="number"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
            />
            <p className="text-xs text-slate-500 mt-1">
              Lower numbers appear first
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-slate-300">Active</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-slate-300">Featured</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-6 border-t border-slate-700">
        <Link
          href="/admin/dashboard/categories"
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
          {loading ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
        </button>
      </div>
    </form>
  );
}
