"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export function BookingModal() {

  const [doctor, setDoctor] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const [bookingNo, setBookingNo] = useState<string | null>(null)
  const [patientData, setPatientData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null)
  const [availability, setAvailability] = useState<any>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {

    const listener = async (e:any) => {

      setDoctor(e.detail)
      setOpen(true)
      setBookingNo(null)
      setErrorMessage(null)

      const res = await fetch("/api/doctor-availability",{cache:"no-store"})
      const data = await res.json()

      setAvailability(data)

    }

    window.addEventListener("open-booking",listener)

    return () => window.removeEventListener("open-booking",listener)

  },[])

  const onSubmit = async (data:any) => {

    try {

      setLoading(true)
      setErrorMessage(null)

      const res = await fetch("/api/bookings",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          ...data,
          doctor: doctor.name
        })
      })

      const result = await res.json()

      if(!res.ok){

        if(result.error === "Doctor not available today"){

          setErrorMessage("Doctor is not available today. Please try another doctor.")

          return

        }

        setErrorMessage("Booking failed. Please try again.")

        return

      }

      if(result.bookingNo){

        setBookingNo(result.bookingNo)
        setPatientData(data)

        const tokenNumber = parseInt(result.bookingNo.split("-")[1])
        const avgConsultationTime = 5

        const wait = (tokenNumber - 1) * avgConsultationTime

        setEstimatedWait(wait)

        reset()

      }

    } catch(error){

      console.error(error)
      setErrorMessage("Server error. Please try again.")

    } finally {

      setLoading(false)

    }

  }

  if(!open) return null

  const whatsappNumber = patientData?.whatsapp || patientData?.phone

  const whatsappMessage = `
Patil Multispeciality Hospital

Appointment Confirmed

Token: ${bookingNo}
Doctor: ${doctor?.name}
Patient: ${patientData?.name}

Estimated Wait: ${estimatedWait} minutes
`

  const whatsappURL =
  `https://api.whatsapp.com/send?phone=91${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}`

  const doctorAvailable = availability[doctor?.name] ?? true

  return (

    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

      <div className="bg-white p-6 rounded-xl w-[380px]">

        <h2 className="text-xl font-semibold mb-4">
          Book with {doctor?.name}
        </h2>

        {!bookingNo && (

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

            {!doctorAvailable && (

              <p className="text-red-600 text-sm font-medium">
                Doctor is not available today
              </p>

            )}

            {errorMessage && (

              <p className="text-red-600 text-sm font-medium">
                {errorMessage}
              </p>

            )}

            <input
              {...register("name")}
              placeholder="Patient Name"
              required
              className="w-full border rounded p-2"
            />

            <input
              {...register("phone")}
              placeholder="Phone Number"
              required
              className="w-full border rounded p-2"
            />

            <input
              {...register("whatsapp")}
              placeholder="WhatsApp Number (optional)"
              className="w-full border rounded p-2"
            />

            <p className="text-xs text-gray-500">
              Enter WhatsApp number if you want booking confirmation on WhatsApp.
            </p>

            <button
              type="submit"
              disabled={loading || !doctorAvailable}
              className={`w-full p-2 rounded text-white ${
                doctorAvailable
                ? "bg-primary"
                : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>

          </form>

        )}

        {bookingNo && (

          <div className="space-y-3 text-center">

            <p className="text-green-600 text-lg font-semibold">
              ✅ Appointment Confirmed
            </p>

            <p>
              <strong>Token:</strong> {bookingNo}
            </p>

            <p>
              <strong>Doctor:</strong> {doctor?.name}
            </p>

            <p>
              <strong>Patient:</strong> {patientData?.name}
            </p>

            <p>
              <strong>Phone:</strong> {patientData?.phone}
            </p>

            {estimatedWait !== null && (

              <p className="text-sm text-blue-600 font-medium">
                Estimated Waiting Time: {estimatedWait} minutes
              </p>

            )}

            <p className="text-sm text-gray-500">
              Please take a screenshot of this booking and show it at reception.
            </p>

            {whatsappNumber && (

              <a
                href={whatsappURL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-green-500 text-white p-2 rounded"
              >
                Send Token via WhatsApp
              </a>

            )}

          </div>

        )}

        <button
          onClick={()=>{
            setOpen(false)
            setBookingNo(null)
            setErrorMessage(null)
          }}
          className="mt-4 text-sm text-gray-500 w-full"
        >
          Close
        </button>

      </div>

    </div>

  )

}