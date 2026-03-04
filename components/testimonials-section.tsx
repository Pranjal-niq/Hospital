"use client"

import { Star, Quote } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const testimonials = [
  {
    name: "Anil Joshi",
    treatment: "Knee Replacement",
    rating: 5,
    text: "Exceptional care from Dr. Patil and the entire team. My knee replacement surgery was a complete success. The staff was caring and professional throughout my stay.",
  },
  {
    name: "Sneha Wankhede",
    treatment: "Maternity Care",
    rating: 5,
    text: "I had a wonderful experience during my delivery. The gynecology team was very supportive and the facilities are excellent. I felt safe and well-cared for at all times.",
  },
  {
    name: "Ramesh Deshmukh",
    treatment: "Cardiac Checkup",
    rating: 5,
    text: "The cardiology department is outstanding. Dr. Kulkarni identified my heart condition early and provided the right treatment plan. The diagnostic equipment is world-class.",
  },
  {
    name: "Priyanka Thakur",
    treatment: "Pediatric Care",
    rating: 5,
    text: "Dr. Sharma is fantastic with children. My son was very comfortable during his treatment. The pediatric department is clean, colorful, and child-friendly. Highly recommended!",
  },
]

export function TestimonialsSection() {
  const { ref, isInView } = useInView()

  return (
    <section id="testimonials" className="py-20 lg:py-28" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Testimonials
          </p>
          <h2
            className="mt-3 text-3xl font-bold text-foreground sm:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            What Our <span className="text-primary">Patients Say</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Real stories from patients who trusted us with their healthcare needs.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {testimonials.map((item, index) => (
            <div
              key={item.name}
              className={`group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 lg:p-8 ${
                isInView
                  ? `animate-fade-up animation-delay-${(index + 1) * 100}`
                  : "opacity-0"
              }`}
            >
              <Quote className="h-8 w-8 text-primary/15" />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground lg:text-base">
                {item.text}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                <div>
                  <p
                    className="text-sm font-semibold text-card-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.treatment}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
