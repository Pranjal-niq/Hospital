"use client"

import { useEffect, useState } from "react"

type QueueType = Record<string, string | null>
type AvailabilityType = Record<string, { available: boolean }>
type Booking = {
  bookingNo: string
  doctor: string
  patient: string
  createdAt: string
}

export default function OpdQueue() {

  const [queue, setQueue] = useState<QueueType>({})
  const [availability, setAvailability] = useState<AvailabilityType>({})
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tokenInput, setTokenInput] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [myToken, setMyToken] = useState("")
  const [checkedDoctor, setCheckedDoctor] = useState("")

  const fetchData = async () => {
    const [queueRes, availabilityRes, bookingsRes] = await Promise.all([
      fetch("/api/queue"),
      fetch("/api/doctor-availability"),
      fetch("/api/today-bookings")
    ])

    const queueData = await queueRes.json()
    const availabilityData = await availabilityRes.json()
    const bookingsData = await bookingsRes.json()

    setQueue(queueData)
    setAvailability(availabilityData)
    setBookings(bookingsData)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  // Listen for token from booking modal — auto fills after booking
  useEffect(() => {

    const handler = (e: any) => {
      const token = e.detail?.token
      const doctor = e.detail?.doctor
      if (token) {
        setTokenInput(token)
        setMyToken(token)
      }
      if (doctor) {
        setSelectedDoctor(doctor)
        setCheckedDoctor(doctor)
      }
    }

    window.addEventListener("booking-confirmed", handler)
    return () => window.removeEventListener("booking-confirmed", handler)

  }, [])

  const normalize = (name: string) =>
    name.replace("Dr.", "").replace("Dr ", "").trim().toLowerCase()

  const formatTime = (iso: string) => {
    if (!iso) return ""
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  }

  const getPositionInfo = (token: string, doctor: string) => {

    // Find booking matching BOTH token AND doctor
    const booking = bookings.find(
      b =>
        b.bookingNo === token &&
        normalize(b.doctor) === normalize(doctor)
    )

    if (!booking) return null

    // Find queue key for this doctor
    const queueKey = Object.keys(queue).find(
      k => normalize(k) === normalize(doctor)
    )

    const currentToken = queueKey ? queue[queueKey] : null

    // Get all waiting bookings for this doctor in order
    const doctorBookings = bookings.filter(
      b => normalize(b.doctor) === normalize(doctor)
    )

    if (doctorBookings.length === 0) return null

    const currentIndex = doctorBookings.findIndex(
      b => b.bookingNo === currentToken
    )

    const myIndex = doctorBookings.findIndex(b => b.bookingNo === token)

    if (myIndex === -1) return { status: "done" }

    const patientsAhead = currentIndex === -1
      ? myIndex
      : myIndex - currentIndex

    if (patientsAhead < 0) return { status: "done" }

    return {
      status: patientsAhead === 0 ? "now" : "waiting",
      doctor: booking.doctor,
      patientsAhead,
      waitMinutes: patientsAhead * 5,
      currentToken,
      bookedAt: booking.createdAt
    }

  }

  const handleCheck = () => {
    if (!selectedDoctor) {
      alert("Please select a doctor")
      return
    }
    if (!tokenInput.trim()) {
      alert("Please enter your token number")
      return
    }
    setMyToken(tokenInput.trim().toUpperCase())
    setCheckedDoctor(selectedDoctor)
  }

  const positionInfo = myToken && checkedDoctor
    ? getPositionInfo(myToken, checkedDoctor)
    : null

  const doctors = Object.keys(availability)

  return (

    <section id="opd-queue" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 space-y-12">

        {/* HEADING */}
        <h2 className="text-3xl font-bold text-center">
          Live OPD Queue
        </h2>

        {/* DOCTOR CARDS */}
        <div className="grid md:grid-cols-4 gap-6">
          {doctors.map((doctor) => {

            const token = queue[doctor]
            const isAvailable = availability[doctor]?.available ?? true

            const doctorBookings = bookings.filter(
              b => normalize(b.doctor) === normalize(doctor)
            )

            const currentIndex = doctorBookings.findIndex(
              b => b.bookingNo === token
            )

            const waitingCount = currentIndex === -1
              ? doctorBookings.length
              : doctorBookings.length - currentIndex - 1

            return (
              <div
                key={doctor}
                className="bg-white border rounded-xl p-6 text-center shadow-sm space-y-3"
              >

                <h3 className="font-semibold text-sm">{doctor}</h3>

                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                  isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {isAvailable ? "Available" : "Not Available"}
                </span>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Now Serving</p>
                  <p className="text-3xl font-bold text-green-600">
                    {token ?? "—"}
                  </p>
                </div>

                {waitingCount > 0 && (
                  <p className="text-xs text-orange-600 font-medium">
                    {waitingCount} patient{waitingCount > 1 ? "s" : ""} waiting
                  </p>
                )}

                {waitingCount === 0 && token && (
                  <p className="text-xs text-gray-400">No one waiting</p>
                )}

              </div>
            )

          })}
        </div>

        {/* TOKEN POSITION CHECKER */}
        <div className="max-w-md mx-auto bg-white border rounded-xl p-6 shadow-sm space-y-4">

          <h3 className="text-lg font-bold text-center">
            Check Your Queue Position
          </h3>

          <p className="text-sm text-gray-500 text-center">
            Select your doctor and enter your token number
          </p>

          {/* DOCTOR DROPDOWN */}
          <select
            value={selectedDoctor}
            onChange={e => setSelectedDoctor(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-700"
          >
            <option value="">Select Doctor</option>
            {doctors.map(doctor => (
              <option key={doctor} value={doctor}>
                {doctor}
              </option>
            ))}
          </select>

          {/* TOKEN INPUT */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. APT-003"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleCheck()}
              className="flex-1 border rounded-lg px-3 py-2 text-sm uppercase"
            />
            <button
              onClick={handleCheck}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Check
            </button>
          </div>

          {/* RESULT */}
          {myToken && checkedDoctor && (

            <div>

              {/* Token not found */}
              {!positionInfo && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-600 font-medium text-sm">
                    Token {myToken} not found for {checkedDoctor} today
                  </p>
                </div>
              )}

              {/* Done */}
              {positionInfo?.status === "done" && (
                <div className="bg-gray-50 border rounded-lg p-4 text-center space-y-1">
                  <p className="text-2xl">✅</p>
                  <p className="font-semibold text-gray-700">
                    Consultation completed
                  </p>
                  <p className="text-xs text-gray-400">Token {myToken}</p>
                </div>
              )}

              {/* Your turn now */}
              {positionInfo?.status === "now" && (
                <div className="bg-green-50 border-2 border-green-400 rounded-lg p-5 text-center space-y-2 animate-pulse">
                  <p className="text-3xl">🔔</p>
                  <p className="font-black text-green-700 text-xl">
                    Your Turn Now!
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    Please go to {positionInfo.doctor}'s cabin
                  </p>
                  {positionInfo.bookedAt && (
                    <p className="text-xs text-gray-400">
                      Booked at {formatTime(positionInfo.bookedAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Waiting */}
              {positionInfo?.status === "waiting" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">

                  <div className="text-center">
                    <p className="text-xs text-gray-500">Your Token</p>
                    <p className="text-2xl font-bold text-blue-600">{myToken}</p>
                    <p className="text-xs text-gray-400">{checkedDoctor}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Patients Ahead</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {positionInfo.patientsAhead}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Est. Wait</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {positionInfo.waitMinutes}
                        <span className="text-sm font-normal"> min</span>
                      </p>
                    </div>

                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-500">
                      Currently serving: <strong>{positionInfo.currentToken ?? "—"}</strong>
                    </p>
                    {positionInfo.bookedAt && (
                      <p className="text-xs text-gray-400">
                        Booked at {formatTime(positionInfo.bookedAt)}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    Auto updates every 5 seconds
                  </p>

                </div>
              )}

            </div>

          )}

        </div>

      </div>
    </section>

  )

}