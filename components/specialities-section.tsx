"use client"

import {
  Bone,
  Heart,
  Baby,
  Stethoscope,
  Activity,
  Microscope,
} from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const specialities = [
  {
    icon: Bone,
    name: "Orthopedics",
    description: "Joint replacements, fracture care, sports injuries, and spine treatments.",
  },
  {
    icon: Heart,
    name: "Cardiology",
    description: "Heart disease management, ECG, Echo, and preventive cardiac care.",
  },
  {
    icon: Baby,
    name: "Gynecology",
    description: "Women's health, prenatal care, delivery, and gynecological surgeries.",
  },
  {
    icon: Stethoscope,
    name: "Pediatrics",
    description: "Comprehensive child healthcare, vaccinations, and growth monitoring.",
  },
  {
    icon: Activity,
    name: "General Medicine",
    description: "Diabetes, hypertension, infections, and chronic disease management.",
  },
  {
    icon: Microscope,
    name: "Diagnostics",
    description: "Advanced laboratory testing, imaging, and pathology services.",
  },
]

export function SpecialitiesSection() {
  const { ref, isInView } = useInView()

  return (
    <section id="specialities" className="bg-muted/50 py-20 lg:py-28" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Our Specialities
          </p>
          <h2
            className="mt-3 text-3xl font-bold text-foreground sm:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Comprehensive Medical <span className="text-primary">Care</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Our hospital offers expert care across multiple specialities, 
            ensuring you receive the best treatment under one roof.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {specialities.map((spec, index) => (
            <div
              key={spec.name}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 ${
                isInView
                  ? `animate-fade-up animation-delay-${(index + 1) * 100}`
                  : "opacity-0"
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <spec.icon className="h-7 w-7" />
              </div>
              <h3
                className="mt-5 text-lg font-semibold text-card-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {spec.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {spec.description}
              </p>
              <div className="absolute -bottom-1 -right-1 h-20 w-20 rounded-tl-[3rem] bg-primary/5 transition-all duration-300 group-hover:bg-primary/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
