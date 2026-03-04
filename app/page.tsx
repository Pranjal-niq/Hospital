import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { SpecialitiesSection } from "@/components/specialities-section"
import { DoctorsSection } from "@/components/doctors-section"
import { AppointmentSection } from "@/components/appointment-section"
import { FacilitiesSection } from "@/components/facilities-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
// import { WhatsAppButton } from "@/components/whatsapp-button"
import OpdQueue from "@/components/opd-queue"


export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <SpecialitiesSection />
        <DoctorsSection />
        <OpdQueue />
        <AppointmentSection />
        <FacilitiesSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
