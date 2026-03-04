"use client"

import { Clock, Activity, ArrowRight, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInView } from "@/hooks/use-in-view"

export function AppointmentSection() {
  const { ref, isInView } = useInView()

  return (
    <section className="relative overflow-hidden bg-primary py-20 lg:py-28" ref={ref}>
      
      {/* Decorative shapes */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary-foreground/5" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary-foreground/5" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* LEFT CONTENT */}
          <div className={`${isInView ? "animate-slide-in-left" : "opacity-0"}`}>

            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "oklch(0.8 0.1 160)" }}
            >
              Book an Appointment
            </p>

            <h2
              className="mt-3 text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Quick & Easy Doctor Appointment
              <br />
              <span style={{ color: "oklch(0.8 0.1 160)" }}>
                Instant OPD Token
              </span>
            </h2>

            <p
              className="mt-5 max-w-lg text-base leading-relaxed lg:text-lg"
              style={{ color: "oklch(0.85 0.03 240)" }}
            >
              Select your doctor and click <strong>Book Appointment</strong>.
              Enter your name and phone number to instantly receive your
              appointment token. Appointments are handled on a
              <strong> First Come, First Serve</strong> basis.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">

              <Button
                asChild
                size="lg"
                className="h-14 rounded-xl bg-accent px-8 text-base font-semibold text-accent-foreground shadow-lg transition-transform hover:scale-105 hover:bg-accent/90"
              >
                <a href="#doctors">
                  Book Appointment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 rounded-xl border-white/30 text-white hover:bg-white/10"
              >
                <a href="#doctors">
                  View Doctors
                </a>
              </Button>

            </div>
          </div>

          {/* RIGHT FEATURE CARDS */}
          <div
            className={`grid grid-cols-2 gap-4 ${
              isInView ? "animate-slide-in-right" : "opacity-0"
            }`}
          >
            {[
              {
                icon: Activity,
                title: "Instant Token Booking",
                desc: "Receive your appointment token instantly",
              },
              {
                icon: Clock,
                title: "First Come First Serve",
                desc: "Fair scheduling for all patients",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-6"
                style={{ backgroundColor: "oklch(1 0 0 / 0.1)" }}
              >

                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "oklch(1 0 0 / 0.15)" }}
                >
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>

                <h3
                  className="mt-4 text-sm font-semibold text-primary-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {item.title}
                </h3>

                <p
                  className="mt-1 text-xs"
                  style={{ color: "oklch(0.8 0 0)" }}
                >
                  {item.desc}
                </p>

              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  )
}