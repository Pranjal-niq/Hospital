"use client"

import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const highlights = [
  "State-of-the-art medical equipment",
  "Experienced team of 20+ specialists",
  "Comprehensive diagnostic services",
  "Patient-centric care approach",
  "Affordable treatment packages",
  "Modern operation theatres",
]

export function AboutSection() {
  const { ref, isInView } = useInView()

  return (
    <section id="about" className="py-20 lg:py-28" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image */}
          <div
            className={`relative ${
              isInView ? "animate-slide-in-left" : "opacity-0"
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/about-hospital.jpg"
                alt="Modern hospital interior"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -right-4 rounded-xl border border-border bg-card p-4 shadow-xl sm:-right-8 sm:p-6">
              <p
                className="text-3xl font-bold text-primary sm:text-4xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                18+
              </p>
              <p className="text-sm text-muted-foreground">
                Years of Excellence
              </p>
            </div>
          </div>

          {/* Content */}
          <div
            className={`${
              isInView ? "animate-slide-in-right" : "opacity-0"
            }`}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              About Us
            </p>
            <h2
              className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your Health, Our{" "}
              <span className="text-primary">Priority</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground lg:text-lg">
              Patil Multispeciality Hospital is a leading healthcare institution 
              in Wardha, dedicated to providing comprehensive medical services 
              with the latest technology and compassionate care. Our team of 
              highly qualified doctors and medical professionals ensures that 
              every patient receives personalized attention and the best 
              possible treatment outcomes.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-lg p-2"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span className="text-sm font-medium text-foreground">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
