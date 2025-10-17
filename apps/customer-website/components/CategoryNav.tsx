"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  icon?: string | null
  parentId?: string | null
  productCount: number
  isFeatured: boolean
  children?: Category[]
}

interface CategoryNavProps {
  categories: Category[]
  mobile?: boolean
  onNavigate?: () => void
}

export function CategoryNav({ categories, mobile = false, onNavigate }: CategoryNavProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null)

  if (mobile) {
    return (
      <nav className="flex flex-col space-y-1">
        {categories.map((category) => (
          <MobileCategoryItem
            key={category.id}
            category={category}
            expandedMobileCategory={expandedMobileCategory}
            setExpandedMobileCategory={setExpandedMobileCategory}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    )
  }

  return (
    <nav className="hidden lg:flex items-center space-x-1">
      {categories.map((category) => (
        <div
          key={category.id}
          className="relative group"
          onMouseEnter={() => setHoveredCategory(category.id)}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <Link
            href={`/category/${category.slug}`}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1"
          >
            {category.icon && <span className="text-base">{category.icon}</span>}
            {category.name}
            {category.children && category.children.length > 0 && (
              <ChevronDown className="w-3 h-3" />
            )}
          </Link>

          {/* Mega Menu */}
          {category.children && category.children.length > 0 && hoveredCategory === category.id && (
            <div className="absolute top-full left-0 w-[600px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6 z-50 mt-2">
              <div className="grid grid-cols-3 gap-6">
                {category.children.map((subCategory) => (
                  <div key={subCategory.id}>
                    <Link
                      href={`/category/${subCategory.slug}`}
                      className="block text-sm font-semibold text-white hover:text-indigo-400 transition-colors mb-2"
                    >
                      {subCategory.icon && <span className="mr-1">{subCategory.icon}</span>}
                      {subCategory.name}
                    </Link>

                    {/* Level 3 categories */}
                    {subCategory.children && subCategory.children.length > 0 && (
                      <ul className="space-y-1">
                        {subCategory.children.map((thirdLevel) => (
                          <li key={thirdLevel.id}>
                            <Link
                              href={`/category/${thirdLevel.slug}`}
                              className="block text-xs text-slate-400 hover:text-indigo-300 transition-colors py-1"
                            >
                              {thirdLevel.name}
                              {thirdLevel.productCount > 0 && (
                                <span className="text-slate-600 ml-1">({thirdLevel.productCount})</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* View All Link */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <Link
                  href={`/category/${category.slug}`}
                  className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  View All {category.name} →
                </Link>
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}

function MobileCategoryItem({
  category,
  expandedMobileCategory,
  setExpandedMobileCategory,
  onNavigate,
  level = 0,
}: {
  category: Category
  expandedMobileCategory: string | null
  setExpandedMobileCategory: (id: string | null) => void
  onNavigate?: () => void
  level?: number
}) {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedMobileCategory === category.id

  const handleToggle = () => {
    if (hasChildren) {
      setExpandedMobileCategory(isExpanded ? null : category.id)
    }
  }

  const paddingLeft = level * 16

  return (
    <div>
      <div
        className="flex items-center justify-between px-4 py-2 hover:bg-slate-800/50 rounded-lg transition-colors"
        style={{ paddingLeft: `${paddingLeft + 16}px` }}
      >
        <Link
          href={`/category/${category.slug}`}
          className="flex-1 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          onClick={onNavigate}
        >
          {category.icon && <span>{category.icon}</span>}
          {category.name}
          {category.productCount > 0 && (
            <span className="text-xs text-slate-600">({category.productCount})</span>
          )}
        </Link>

        {hasChildren && (
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-slate-700/50 rounded transition-colors"
          >
            <ChevronRight
              className={`w-4 h-4 text-slate-400 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* Subcategories */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {category.children?.map((child) => (
            <MobileCategoryItem
              key={child.id}
              category={child}
              expandedMobileCategory={expandedMobileCategory}
              setExpandedMobileCategory={setExpandedMobileCategory}
              onNavigate={onNavigate}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
