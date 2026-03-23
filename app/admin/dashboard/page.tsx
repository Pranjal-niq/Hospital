"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Booking = {
  bookingNo: string
  doctor: string
  patient: string
}

type QueueType = Record<string, string | null>

type AvailabilityType = Record<
  string,
  {
    available: boolean
  }
>

type WalkInForm = {
  doctor: string
  name: string
  phone: string
}

export default function Dashboard(){

  const router = useRouter()

  const [bookings,setBookings] = useState<Booking[]>([])
  const [queue,setQueue] = useState<QueueType>({})
  const [availability,setAvailability] = useState<AvailabilityType>({})

  const [username,setUsername] = useState("")
  const [role,setRole] = useState("")

  // Walk-in state
  const [walkInOpen,setWalkInOpen] = useState(false)
  const [walkInForm,setWalkInForm] = useState<WalkInForm>({
    doctor:"",
    name:"",
    phone:""
  })
  const [walkInLoading,setWalkInLoading] = useState(false)
  const [walkInToken,setWalkInToken] = useState<string|null>(null)

  const normalize = (name:string)=>
    name.replace("Dr.","").replace("Dr ","").trim().toLowerCase()

  useEffect(()=>{

    loadBookings()
    loadQueue()
    loadAvailability()
    loadUser()

    const interval = setInterval(()=>{
      loadBookings()
      loadQueue()
    },2000)

    return ()=>clearInterval(interval)

  },[])

  const loadUser = async ()=>{

    const res = await fetch("/api/me")

    if(!res.ok){
      router.push("/admin/login")
      return
    }

    const data = await res.json()
    setUsername(data.username)
    setRole(data.role)

  }

  const logout = async ()=>{
    await fetch("/api/logout")
    router.push("/admin/login")
  }

  const loadBookings = async ()=>{
    const res = await fetch("/api/today-bookings",{cache:"no-store"})
    const data = await res.json()
    setBookings(data)
  }

  const loadQueue = async ()=>{
    const res = await fetch("/api/queue",{cache:"no-store"})
    const data = await res.json()
    setQueue(data)
  }

  const loadAvailability = async ()=>{
    const res = await fetch("/api/doctor-availability",{cache:"no-store"})
    const data = await res.json()
    setAvailability(data)
  }

  const toggleDoctor = async (doctor:string)=>{

    if(role === "doctor" && !doctor.toLowerCase().includes(username)){
      alert("You can only control your own availability")
      return
    }

    const current = availability[doctor]?.available ?? true

    const res = await fetch("/api/doctor-availability",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ doctor, available: !current })
    })

    if(res.ok){
      setAvailability(prev=>({
        ...prev,
        [doctor]:{ available: !current }
      }))
    }

  }

  const clearDoctorBookings = async (doctor:string)=>{

    const confirmClear = confirm(
      `Are you sure you want to clear today's bookings for ${doctor}?`
    )

    if(!confirmClear) return

    await fetch("/api/clear-doctor-bookings",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({doctor})
    })

    loadBookings()
    loadQueue()

  }

  const speakPatient = (patient:string,doctor:string)=>{

    const voices = window.speechSynthesis.getVoices()

    const voice =
      voices.find(v=>v.lang==="hi-IN") ||
      voices.find(v=>v.lang.includes("en-IN")) ||
      voices[0]

    const cleanDoctor = doctor.replace("Dr.","").replace("Dr ","")

    const marathiText =
      `${patient}. कृपया डॉक्टर ${cleanDoctor} यांच्या केबिनमध्ये या.`

    const speech = new SpeechSynthesisUtterance(marathiText)
    speech.voice = voice

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(speech)

  }

  const callToken = async (doctor:string,token:string,patient:string)=>{

    speakPatient(patient,doctor)

    await fetch("/api/queue",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ doctor, token })
    })

    loadQueue()

  }

  const finishToken = async (doctor:string,items:Booking[])=>{

    const currentToken = queue[doctor]

    // Mark current patient as done — removes from waiting list
    if(currentToken){
      await fetch("/api/complete-booking",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ token: currentToken })
      })
    }

    // Find next waiting patient
    const currentIndex = items.findIndex(b=>b.bookingNo===currentToken)
    const nextPatient = items[currentIndex+1]

    if(nextPatient){
      await fetch("/api/queue",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ doctor, token:nextPatient.bookingNo })
      })
    }else{
      await fetch("/api/queue",{
        method:"DELETE",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ doctor })
      })
    }

    loadQueue()
    loadBookings()

  }

  const resetAll = async ()=>{

    await fetch("/api/queue",{
      method:"DELETE",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({})
    })

    loadQueue()

  }

  // WALK-IN BOOKING
  const openWalkIn = (doctor:string)=>{
    setWalkInForm({ doctor, name:"", phone:"" })
    setWalkInToken(null)
    setWalkInOpen(true)
  }

  const submitWalkIn = async ()=>{

    if(!walkInForm.name.trim()){
      alert("Please enter patient name")
      return
    }

    try{

      setWalkInLoading(true)

      const res = await fetch("/api/bookings",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          doctor: walkInForm.doctor,
          name: walkInForm.name,
          phone: walkInForm.phone || "walk-in"
        })
      })

      const data = await res.json()

      if(!res.ok){
        alert(data.error || "Booking failed")
        return
      }

      setWalkInToken(data.bookingNo)
      loadBookings()
      loadQueue()

    }catch(err){
      alert("Server error. Please try again.")
    }finally{
      setWalkInLoading(false)
    }

  }

  const doctors = Object.keys(availability)

  return(

    <div className="max-w-6xl mx-auto py-16 space-y-8 px-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <h1 className="text-xl font-bold">Reception Dashboard</h1>

        <div className="flex items-center gap-4">

          <span className="text-sm text-gray-600">
            Logged in as: {username} ({role})
          </span>

          <button
            onClick={logout}
            className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
          >
            Logout
          </button>

          {role === "reception" && (
            <button
              onClick={resetAll}
              className="bg-red-600 text-white px-3 py-1.5 rounded text-sm"
            >
              Reset All
            </button>
          )}

        </div>

      </div>

      {/* DOCTOR CARDS */}
      {doctors.map((doctor)=>{

        const items = bookings.filter(
          b=>normalize(b.doctor)===normalize(doctor)
        )

        const waitingItems = items.filter(b=>b.bookingNo!==queue[doctor])
        const currentToken = queue[doctor]
        const isAvailable = availability[doctor]?.available ?? true

        return(

          <div key={doctor} className="border rounded-xl p-4 space-y-4">

            {/* DOCTOR HEADER */}
            <div className="flex justify-between items-center">

              <div className="flex items-center gap-3">

                <h2 className="text-lg font-semibold">{doctor}</h2>

                {/* WAITING COUNT BADGE */}
                {waitingItems.length > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {waitingItems.length} waiting
                  </span>
                )}

              </div>

              <div className="flex items-center gap-2">

                {/* WALK-IN BUTTON */}
                {role === "reception" && (
                  <button
                    onClick={()=>openWalkIn(doctor)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold"
                  >
                    + Walk-in
                  </button>
                )}

                <button
                  onClick={()=>toggleDoctor(doctor)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {isAvailable ? "Available" : "Not Available"}
                </button>

              </div>

            </div>

            {/* NOW SERVING */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">

              <p className="text-xs text-gray-500">Now Serving</p>

              <p className="text-2xl font-bold text-blue-600">
                {currentToken ?? "Waiting"}
              </p>

              {currentToken && (
                <button
                  onClick={()=>finishToken(doctor,items)}
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Finish Consultation
                </button>
              )}

            </div>

            {/* WAITING LIST */}
            <div className="space-y-2">

              <p className="text-sm font-medium">Waiting Patients</p>

              {waitingItems.length === 0 && (
                <p className="text-xs text-gray-400">No patients waiting</p>
              )}

              {waitingItems.map((b,index)=>(

                <button
                  key={b.bookingNo}
                  onClick={()=>callToken(b.doctor,b.bookingNo,b.patient)}
                  className="w-full border px-3 py-2 rounded flex justify-between items-center hover:bg-gray-50 transition"
                >

                  <div className="flex items-center gap-3 text-left">

                    <span className="text-xs text-gray-400 w-4">
                      {index+1}
                    </span>

                    <div>
                      <p className="text-sm font-semibold">{b.patient}</p>
                      <p className="text-xs text-gray-500">{b.bookingNo}</p>
                    </div>

                  </div>

                  <span className="text-xs text-blue-600 font-semibold">
                    CALL
                  </span>

                </button>

              ))}

            </div>

            {role === "reception" && (
              <button
                onClick={()=>clearDoctorBookings(doctor)}
                className="bg-red-500 text-white px-3 py-1 rounded text-xs"
              >
                Clear Today's Bookings
              </button>
            )}

          </div>

        )

      })}

      {/* WALK-IN MODAL */}
      {walkInOpen && (

        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

          <div className="bg-white p-6 rounded-xl w-[360px] space-y-4">

            <h2 className="text-lg font-bold">
              Walk-in Patient
            </h2>

            <p className="text-sm text-gray-500">
              Doctor: <strong>{walkInForm.doctor}</strong>
            </p>

            {!walkInToken ? (

              <div className="space-y-3">

                <input
                  type="text"
                  placeholder="Patient Name *"
                  value={walkInForm.name}
                  onChange={e=>setWalkInForm(p=>({...p,name:e.target.value}))}
                  className="w-full border rounded p-2 text-sm"
                />

                <input
                  type="text"
                  placeholder="Phone Number (optional)"
                  value={walkInForm.phone}
                  onChange={e=>setWalkInForm(p=>({...p,phone:e.target.value}))}
                  className="w-full border rounded p-2 text-sm"
                />

                <button
                  onClick={submitWalkIn}
                  disabled={walkInLoading}
                  className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
                >
                  {walkInLoading ? "Adding..." : "Add to Queue"}
                </button>

              </div>

            ):(

              <div className="text-center space-y-3">

                <p className="text-green-600 font-semibold text-lg">
                  ✅ Patient Added
                </p>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-blue-600">
                    {walkInToken}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {walkInForm.name}
                  </p>
                </div>

                <button
                  onClick={()=>{
                    setWalkInToken(null)
                    setWalkInForm(p=>({...p,name:"",phone:""}))
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
                >
                  Add Another Patient
                </button>

              </div>

            )}

            <button
              onClick={()=>{
                setWalkInOpen(false)
                setWalkInToken(null)
              }}
              className="w-full text-sm text-gray-400"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  )

}