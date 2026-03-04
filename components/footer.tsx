import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">P</span>
              </div>
              <div>
                <p
                  className="text-sm font-bold leading-tight text-foreground"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Patil Multispeciality
                </p>
                <p className="text-xs text-muted-foreground">Hospital, Wardha</p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Providing advanced healthcare with compassion and 
              cutting-edge technology since 2005.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "About Us", href: "#about" },
                { label: "Specialities", href: "#specialities" },
                { label: "Our Doctors", href: "#doctors" },
                { label: "Facilities", href: "#facilities" },
                { label: "Testimonials", href: "#testimonials" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Specialities */}
          <div>
            <h4
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Specialities
            </h4>
            <ul className="mt-4 space-y-2.5">
              {[
                "Orthopedics",
                "Cardiology",
                "Gynecology",
                "Pediatrics",
                "General Medicine",
                "Diagnostics",
              ].map((spec) => (
                <li key={spec}>
                  <span className="text-sm text-muted-foreground">{spec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Contact
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Wardha, Maharashtra, India
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href="tel:+911234567890"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  +91 12345 67890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href="mailto:info@patilhospital.com"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  info@patilhospital.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Patil Multispeciality Hospital, Wardha. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
