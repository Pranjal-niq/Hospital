"use client"

import { Phone, MapPin, Mail, Clock } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const contactInfo = [
  {
    icon: MapPin,
    label: "Address",
    value: "Patil Multispeciality Hospital, Wardha, Maharashtra, India",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 12345 67890",
    href: "tel:+911234567890",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@patilhospital.com",
    href: "mailto:info@patilhospital.com",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "24/7 Emergency | OPD: 9 AM - 8 PM",
  },
]

export function ContactSection() {
  const { ref, isInView } = useInView()

  return (
    <section id="contact" className="bg-muted/50 py-20 lg:py-28" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Contact Us
          </p>
          <h2
            className="mt-3 text-3xl font-bold text-foreground sm:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Get In <span className="text-primary">Touch</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            We are here to help. Reach out to us for appointments, 
            inquiries, or any assistance you need.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {/* Contact info cards */}
          <div
            className={`space-y-4 ${
              isInView ? "animate-slide-in-left" : "opacity-0"
            }`}
          >
            {contactInfo.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold text-card-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-0.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Google Map embed */}
          <div
            className={`overflow-hidden rounded-2xl border border-border ${
              isInView ? "animate-slide-in-right" : "opacity-0"
            }`}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29836.82946762!2d78.57!3d20.74!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd4719d09f1fc0b%3A0x3c21b27d2f2b7e9d!2sWardha%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "350px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Patil Multispeciality Hospital location on Google Maps"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
