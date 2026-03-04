"use client"

import {
  ShieldCheck,
  HeartPulse,
  Syringe,
  FlaskConical,
  Pill,
} from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const facilities = [
  {
    icon: ShieldCheck,
    name: "24/7 Emergency",
    description:
      "Round-the-clock emergency services with rapid response teams and fully equipped ambulances.",
  },
  {
    icon: HeartPulse,
    name: "ICU",
    description:
      "State-of-the-art intensive care units with advanced monitoring and life-support equipment.",
  },
  {
    icon: Syringe,
    name: "Operation Theatre",
    description:
      "Modern, fully equipped operation theatres with the latest surgical instruments and technology.",
  },
  {
    icon: FlaskConical,
    name: "Lab & Diagnostics",
    description:
      "In-house laboratory with advanced diagnostic equipment for accurate and quick test results.",
  },
  {
    icon: Pill,
    name: "Pharmacy",
    description:
      "24/7 in-house pharmacy stocked with all essential medications and surgical supplies.",
  },
]

export function FacilitiesSection() {
  const { ref, isInView } = useInView()

  return (
    <section id="facilities" className="bg-muted/50 py-20 lg:py-28" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Our Facilities
          </p>
          <h2
            className="mt-3 text-3xl font-bold text-foreground sm:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            World-Class <span className="text-primary">Infrastructure</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Equipped with modern facilities and cutting-edge technology 
            to deliver the highest standard of medical care.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility, index) => (
            <div
              key={facility.name}
              className={`group relative flex items-start gap-5 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 ${
                index === 0
                  ? "sm:col-span-2 lg:col-span-1"
                  : ""
              } ${
                isInView
                  ? `animate-fade-up animation-delay-${(index + 1) * 100}`
                  : "opacity-0"
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <facility.icon className="h-6 w-6" />
              </div>
              <div>
                <h3
                  className="text-base font-semibold text-card-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {facility.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {facility.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
