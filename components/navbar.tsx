"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#specialities", label: "Specialities" },
  { href: "#doctors", label: "Doctors" },
  { href: "#facilities", label: "Facilities" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#contact", label: "Contact" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">
                P
              </span>
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight text-foreground">
                Patil Multispeciality
              </p>
              <p className="text-xs text-muted-foreground">
                Hospital, Wardha
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">

            <a
              href="tel:+911234567890"
              className="hidden items-center gap-2 rounded-lg border border-primary/20 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 sm:flex"
            >
              <Phone className="h-4 w-4" />
              Emergency
            </a>

            <Button
              asChild
              size="sm"
              className="hidden bg-primary text-primary-foreground hover:bg-primary/90 sm:inline-flex"
            >
              <a href="#doctors">
                Book Appointment
              </a>
            </Button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-foreground transition-colors hover:bg-muted lg:hidden"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
          isOpen ? "max-h-96 border-t border-border/50" : "max-h-0"
        }`}
      >
        <div className="bg-card/95 backdrop-blur-lg px-4 py-4 space-y-1">

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex gap-2 pt-3 border-t border-border/50">

            <a
              href="tel:+911234567890"
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-primary/20 py-2.5 text-sm font-medium text-primary"
            >
              <Phone className="h-4 w-4" />
              Emergency
            </a>

            <a
              href="#doctors"
              onClick={() => setIsOpen(false)}
              className="flex-1 flex items-center justify-center rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground"
            >
              Book Appointment
            </a>

          </div>

        </div>
      </div>
    </nav>
  )
}