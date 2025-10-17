"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import "swiper/css/effect-fade"

interface BannerSlide {
  id: string
  title: string
  subtitle?: string
  description?: string
  image: string
  ctaText?: string
  ctaLink?: string
  textPosition?: "left" | "center" | "right"
  darkOverlay?: boolean
}

export function HomeBanner() {
  const [slides] = useState<BannerSlide[]>([
    {
      id: "1",
      title: "AI-Powered Shopping",
      subtitle: "Experience the Future",
      description: "Smart recommendations, semantic search, and personalized experiences powered by AI",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
      ctaText: "Shop Now",
      ctaLink: "/products",
      textPosition: "left",
      darkOverlay: true,
    },
    {
      id: "2",
      title: "Trending Collection",
      subtitle: "New Arrivals 2024",
      description: "Discover the latest products curated just for you",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80",
      ctaText: "Explore Collection",
      ctaLink: "/products?trending=true",
      textPosition: "center",
      darkOverlay: true,
    },
    {
      id: "3",
      title: "Exclusive Deals",
      subtitle: "Up to 50% Off",
      description: "Limited time offers on selected items",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80",
      ctaText: "View Deals",
      ctaLink: "/products?sale=true",
      textPosition: "right",
      darkOverlay: true,
    },
  ])

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        speed={800}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-white/50",
          bulletActiveClass: "swiper-pagination-bullet-active !bg-white",
        }}
        navigation={{
          prevEl: ".banner-prev",
          nextEl: ".banner-next",
        }}
        loop={true}
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority
              />

              {/* Dark Overlay */}
              {slide.darkOverlay && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              )}

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                  <div
                    className={`max-w-2xl ${
                      slide.textPosition === "center"
                        ? "mx-auto text-center"
                        : slide.textPosition === "right"
                        ? "ml-auto text-right"
                        : "text-left"
                    }`}
                  >
                    {slide.subtitle && (
                      <p className="text-indigo-400 font-semibold text-sm md:text-base mb-2 md:mb-4 uppercase tracking-wider">
                        {slide.subtitle}
                      </p>
                    )}

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-6 leading-tight">
                      {slide.title}
                    </h1>

                    {slide.description && (
                      <p className="text-slate-200 text-base md:text-lg mb-6 md:mb-8 max-w-xl">
                        {slide.description}
                      </p>
                    )}

                    {slide.ctaText && slide.ctaLink && (
                      <Link
                        href={slide.ctaLink}
                        className="inline-block px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                      >
                        {slide.ctaText}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      <button className="banner-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all group">
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
      </button>

      <button className="banner-next absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all group">
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  )
}
