"use client";

import Image from "next/image";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/use-in-view";
import { useEffect, useState } from "react";

const doctors = [
  {
    name: "Dr. Rajesh Patil",
    specialization: "Orthopedics & Joint Replacement",
    experience: "20+ Years Experience",
    image: "/images/doctor-1.jpg",
  },
  {
    name: "Dr. Sunita Deshmukh",
    specialization: "Gynecology & Obstetrics",
    experience: "15+ Years Experience",
    image: "/images/doctor-2.jpg",
  },
  {
    name: "Dr. Mohan Kulkarni",
    specialization: "Cardiology",
    experience: "18+ Years Experience",
    image: "/images/doctor-3.jpg",
  },
  {
    name: "Dr. Priya Sharma",
    specialization: "Pediatrics & Neonatology",
    experience: "12+ Years Experience",
    image: "/images/doctor-4.jpg",
  },
];

export function DoctorsSection() {

  const { ref, isInView } = useInView();
  const [availability, setAvailability] = useState<any>({});

  useEffect(() => {

    const loadAvailability = async () => {

      try {

        const res = await fetch("/api/doctor-availability", {
          cache: "no-store"
        });

        const data = await res.json();

        setAvailability(data);

      } catch (err) {

        console.error("Availability load error", err);

      }

    };

    loadAvailability();

    const interval = setInterval(loadAvailability, 2000);

    return () => clearInterval(interval);

  }, []);

  const isDoctorAvailable = (doctorName: string) => {

    let available = true;

    const cleanDoctor = doctorName
      .replace("Dr.", "")
      .replace("Dr ", "")
      .trim()
      .toLowerCase();

    for (const key in availability) {

      const cleanKey = key
        .replace("Dr.", "")
        .replace("Dr ", "")
        .trim()
        .toLowerCase();

      if (cleanKey === cleanDoctor) {

        const value = availability[key];

        if (typeof value === "object") {
          available = value.available;
        } else {
          available = value;
        }

        break;

      }

    }

    return available;

  };

  return (
    <section id="doctors" className="py-20 lg:py-28" ref={ref}>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div
          className={`text-center ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >

          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Our Doctors
          </p>

          <h2
            className="mt-3 text-3xl font-bold text-foreground sm:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Meet Our <span className="text-primary">Expert Team</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Our experienced team of doctors brings decades of expertise in
            providing compassionate and effective medical care.
          </p>

        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {doctors.map((doctor, index) => {

            const available = isDoctorAvailable(doctor.name);

            return (

              <div
                key={doctor.name}
                className={`group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 ${
                  isInView
                    ? `animate-fade-up animation-delay-${(index + 1) * 100}`
                    : "opacity-0"
                }`}
              >

                <div className="relative aspect-[3/4] overflow-hidden">

                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

                </div>

                <div className="p-5">

                  <h3
                    className="text-lg font-semibold text-card-foreground"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    👨‍⚕️ {doctor.name}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-primary">
                    🦴 {doctor.specialization}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="text-xs">{doctor.experience}</span>
                  </div>

                  <p
                    className={`mt-2 text-sm font-semibold ${
                      available
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {available ? "🟢 Available Today" : "🔴 Not Available"}
                  </p>

                  <Button
                    disabled={!available}
                    className={`mt-4 w-full rounded-xl ${
                      available
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                    size="sm"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("open-booking", { detail: doctor })
                      )
                    }
                  >
                    {available ? "Book Appointment" : "Doctor Unavailable"}
                  </Button>

                </div>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}