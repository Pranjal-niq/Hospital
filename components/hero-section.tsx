"use client"

import Image from "next/image"
import { Phone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInView } from "@/hooks/use-in-view"

export function HeroSection() {
  const { ref, isInView } = useInView()

  return (
    <section className="relative min-h-screen overflow-hidden" ref={ref}>
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hospital-hero.jpg"
          alt="Patil Multispeciality Hospital building"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl pt-20 pb-16">
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 backdrop-blur-sm ${
              isInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse-gentle" />
            <span className="text-sm font-medium text-primary-foreground">
              Trusted Healthcare Since 2005
            </span>
          </div>

          <h1
            className={`text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl ${
              isInView ? "animate-fade-up animation-delay-100" : "opacity-0"
            }`}
            style={{ fontFamily: "var(--font-heading)", color: "white" }}
          >
            Patil
            <br />
            Multispeciality
            <br />
            <span style={{ color: "oklch(0.75 0.14 160)" }}>Hospital</span>
          </h1>

          <p
            className={`mt-6 max-w-lg text-lg leading-relaxed sm:text-xl ${
              isInView ? "animate-fade-up animation-delay-200" : "opacity-0"
            }`}
            style={{ color: "oklch(0.85 0 0)" }}
          >
            Advanced healthcare with compassion in the heart of Wardha. 
            Experience world-class medical treatment with our team of 
            experienced specialists.
          </p>

          <div
            className={`mt-8 flex flex-col gap-4 sm:flex-row ${
              isInView ? "animate-fade-up animation-delay-300" : "opacity-0"
            }`}
          >
          </div>

          {/* Stats */}
          <div
            className={`mt-12 grid grid-cols-3 gap-6 border-t pt-8 ${
              isInView ? "animate-fade-up animation-delay-400" : "opacity-0"
            }`}
            style={{ borderColor: "oklch(1 0 0 / 0.15)" }}
          >
            {[
              { value: "20+", label: "Specialists" },
              { value: "15K+", label: "Patients Treated" },
              { value: "24/7", label: "Emergency Care" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold sm:text-3xl" style={{ color: "white", fontFamily: "var(--font-heading)" }}>
                  {stat.value}
                </p>
                <p className="mt-1 text-xs sm:text-sm" style={{ color: "oklch(0.8 0 0)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
