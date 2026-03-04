"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

export function BookingModal() {

  const [doctor, setDoctor] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const [bookingNo, setBookingNo] = useState<string | null>(null)
  const [patientData, setPatientData] = useState<any>(null)

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {

    const listener = (e:any) => {
      setDoctor(e.detail)
      setOpen(true)
      setBookingNo(null)
    }

    window.addEventListener("open-booking", listener)

    return () => window.removeEventListener("open-booking", listener)

  }, [])

  const onSubmit = async (data:any) => {

    const res = await fetch("/api/bookings", {
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

    if(result.bookingNo){

      setBookingNo(result.bookingNo)
      setPatientData(data)

      const message = `New Appointment

Token: ${result.bookingNo}
Doctor: ${doctor.name}
Patient: ${data.name}
Phone: ${data.phone}`

      const whatsappURL =
        "https://wa.me/919XXXXXXXXX?text=" +
        encodeURIComponent(message)

      window.open(whatsappURL, "_blank")

      reset()
    }

  }

  if(!open) return null

  return (

    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

      <div className="bg-white p-6 rounded-xl w-[380px]">

        <h2 className="text-xl font-semibold mb-4">
          Book with {doctor?.name}
        </h2>

        {!bookingNo && (

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

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

            <button
              type="submit"
              className="w-full bg-primary text-white p-2 rounded"
            >
              Confirm Booking
            </button>

          </form>

        )}

        {bookingNo && (

          <div className="space-y-3 text-center">

            <p className="text-green-600 text-lg font-semibold">
              ✅ Appointment Request Submitted
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

            <p className="text-sm text-gray-500">
              Please take a screenshot of this booking and show it at reception.
            </p>

          </div>

        )}

        <button
          onClick={()=>setOpen(false)}
          className="mt-4 text-sm text-gray-500 w-full"
        >
          Close
        </button>

      </div>

    </div>

  )
}