"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Booking = {
  bookingNo: string
  doctor: string
  patient: string
}

type QueueType = Record<string, string | null>

export default function Dashboard() {

  const router = useRouter()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [queue, setQueue] = useState<QueueType>({})

  useEffect(() => {

    const auth = localStorage.getItem("adminAuth")

    if (auth !== "true") {
      router.push("/admin/login")
      return
    }

    loadBookings()
    loadQueue()

  }, [])

  const loadBookings = async () => {

    const res = await fetch("/api/today-bookings")
    const data = await res.json()

    setBookings(data)

  }

  const loadQueue = async () => {

    const res = await fetch("/api/queue")
    const data = await res.json()

    setQueue(data)

  }

  // ANNOUNCEMENT FUNCTION (PATIENT NAME)

const speakPatient = (patient: string, doctor: string) => {

  const speak = () => {

    const voices = window.speechSynthesis.getVoices()

    const voice =
      voices.find(v => v.lang === "hi-IN") ||
      voices.find(v => v.lang.includes("en-IN")) ||
      voices[0]

    const cleanDoctor = doctor.replace("Dr.", "").replace("Dr ", "")

    const marathiText =
      `${patient}. कृपया डॉक्टर ${cleanDoctor} यांच्या केबिनमध्ये या.`

    const hindiText =
      `${patient}. कृपया डॉक्टर ${cleanDoctor} के केबिन में आएं.`

    const marathiSpeech = new SpeechSynthesisUtterance(marathiText)
    marathiSpeech.voice = voice
    marathiSpeech.rate = 0.9

    const hindiSpeech = new SpeechSynthesisUtterance(hindiText)
    hindiSpeech.voice = voice
    hindiSpeech.rate = 0.9

    window.speechSynthesis.cancel()

    window.speechSynthesis.speak(marathiSpeech)

    setTimeout(() => {
      window.speechSynthesis.speak(hindiSpeech)
    }, 3500)

  }

  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = speak
  } else {
    speak()
  }

}

  const callToken = async (doctor: string, token: string, patient: string) => {

    speakPatient(patient, doctor)

    await fetch("/api/queue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        doctor,
        token
      })
    })

    loadQueue()

  }

  const finishToken = async (doctor: string, items: Booking[]) => {

    const currentToken = queue[doctor]

    const currentIndex = items.findIndex(
      (b) => b.bookingNo === currentToken
    )

    const nextPatient = items[currentIndex + 1]

    if (nextPatient) {

      speakPatient(nextPatient.patient, doctor)

      await fetch("/api/queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          doctor,
          token: nextPatient.bookingNo
        })
      })

    } else {

      await fetch("/api/queue", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          doctor
        })
      })

    }

    loadQueue()

  }

  const resetAll = async () => {

    await fetch("/api/queue", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    })

    loadQueue()

  }

  const grouped = bookings.reduce((acc: Record<string, Booking[]>, booking) => {

    if (!acc[booking.doctor]) {
      acc[booking.doctor] = []
    }

    acc[booking.doctor].push(booking)

    return acc

  }, {})

  return (

    <div className="max-w-6xl mx-auto py-20 space-y-12">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          Reception Dashboard
        </h1>

        <button
          onClick={resetAll}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Reset All
        </button>

      </div>

      {Object.entries(grouped).map(([doctor, items]) => {

        const currentToken = queue[doctor]

        return (

          <div key={doctor} className="border rounded-xl p-6 space-y-6">

            <h2 className="text-xl font-semibold">
              {doctor}
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">

              <p className="text-sm text-gray-500">
                Now Serving
              </p>

              <p className="text-3xl font-bold text-blue-600">
                {currentToken ?? "Waiting"}
              </p>

              {currentToken && (

                <button
                  onClick={() => finishToken(doctor, items)}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                >
                  Finish Consultation
                </button>

              )}

            </div>

            <div className="space-y-3">

              <p className="font-medium">
                Waiting Patients
              </p>

              {items
                .filter((b) => b.bookingNo !== currentToken)
                .map((b) => (

                  <button
                    key={b.bookingNo}
                    onClick={() => callToken(b.doctor, b.bookingNo, b.patient)}
                    className="w-full border p-4 rounded flex justify-between items-center hover:bg-gray-50 transition"
                  >

                    <div>

                      <p className="font-semibold">
                        {b.patient}
                      </p>

                      <p className="text-sm text-gray-500">
                        {b.bookingNo}
                      </p>

                    </div>

                    <span className="text-xs text-blue-600 font-semibold">
                      CALL
                    </span>

                  </button>

                ))}

            </div>

          </div>

        )

      })}

    </div>

  )

}