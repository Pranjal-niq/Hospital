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
    dailyLimit: number
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

  const [walkInOpen,setWalkInOpen] = useState(false)
  const [walkInForm,setWalkInForm] = useState<WalkInForm>({
    doctor:"",
    name:"",
    phone:""
  })
  const [walkInLoading,setWalkInLoading] = useState(false)
  const [walkInToken,setWalkInToken] = useState<string|null>(null)

  const [editingLimit,setEditingLimit] = useState<string|null>(null)
  const [limitInput,setLimitInput] = useState<number>(30)

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
    if(role === "doctor" && !normalize(doctor).includes(username.toLowerCase())){
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
        [doctor]:{ ...prev[doctor], available: !current }
      }))
    }
  }

  const saveLimit = async (doctor:string)=>{
    if(role === "doctor" && !normalize(doctor).includes(username.toLowerCase())){
      alert("You can only set your own limit")
      return
    }

    const res = await fetch("/api/doctor-availability",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ doctor, dailyLimit: limitInput })
    })

    if(res.ok){
      setAvailability(prev=>({
        ...prev,
        [doctor]:{ ...prev[doctor], dailyLimit: limitInput }
      }))
      setEditingLimit(null)
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

  const speakPatient = (patient:string, doctor:string)=>{
    const cleanDoctor = doctor.replace("Dr.","").replace("Dr ","").trim()
    const marathiText =
      `${patient}... कृपया... डॉक्टर ${cleanDoctor} यांच्या केबिनमध्ये यावे. धन्यवाद.`

    const speak = (voices: SpeechSynthesisVoice[])=>{
      const voice =
        voices.find(v => v.lang === "mr-IN") ||
        voices.find(v => v.lang === "hi-IN") ||
        voices.find(v => v.lang.includes("en-IN")) ||
        voices[0]

      const speech = new SpeechSynthesisUtterance(marathiText)
      speech.voice = voice
      speech.rate = 0.85
      speech.pitch = 1
      speech.volume = 1

      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(speech)
    }

    const voices = window.speechSynthesis.getVoices()
    if(voices.length > 0){
      speak(voices)
    } else {
      window.speechSynthesis.onvoiceschanged = ()=>{
        speak(window.speechSynthesis.getVoices())
      }
    }
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

    if(currentToken){
      await fetch("/api/complete-booking",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ token: currentToken })
      })
    }

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

  const doctors = role === "doctor"
    ? Object.keys(availability).filter(d =>
        normalize(d).includes(username.toLowerCase())
      )
    : Object.keys(availability)

  return(

    <div className="max-w-6xl mx-auto py-16 space-y-8 px-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <h1 className="text-xl font-bold">
          {role === "doctor" ? "Doctor Dashboard" : "Reception Dashboard"}
        </h1>

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
        const dailyLimit = availability[doctor]?.dailyLimit ?? 30
        const totalToday = bookings.filter(
          b=>normalize(b.doctor)===normalize(doctor)
        ).length
        const spotsLeft = dailyLimit - totalToday

        return(

          <div key={doctor} className="border rounded-xl p-4 space-y-4">

            {/* DOCTOR HEADER */}
            <div className="flex justify-between items-center">

              <div className="flex items-center gap-3 flex-wrap">

                <h2 className="text-lg font-semibold">{doctor}</h2>

                {waitingItems.length > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {waitingItems.length} waiting
                  </span>
                )}

                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  spotsLeft <= 0
                    ? "bg-red-100 text-red-700"
                    : spotsLeft <= 5
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {spotsLeft <= 0 ? "Full today" : `${spotsLeft} slots left`}
                </span>

              </div>

              <div className="flex items-center gap-2">

                {role === "reception" && (
                  <button
                    onClick={()=>openWalkIn(doctor)}
                    disabled={spotsLeft <= 0}
                    className={`px-3 py-1 rounded text-xs font-semibold text-white ${
                      spotsLeft <= 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600"
                    }`}
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

            {/* DAILY LIMIT ROW */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">

              <span className="text-xs text-gray-500">Daily limit:</span>

              {editingLimit === doctor ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={limitInput}
                    onChange={e=>setLimitInput(parseInt(e.target.value))}
                    className="w-16 border rounded px-2 py-0.5 text-sm text-center"
                  />
                  <button
                    onClick={()=>saveLimit(doctor)}
                    className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs"
                  >
                    Save
                  </button>
                  <button
                    onClick={()=>setEditingLimit(null)}
                    className="text-gray-400 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ):(
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {dailyLimit} patients
                  </span>
                  <button
                    onClick={()=>{
                      setEditingLimit(doctor)
                      setLimitInput(dailyLimit)
                    }}
                    className="text-blue-500 text-xs underline"
                  >
                    Change
                  </button>
                </div>
              )}

              <span className="text-xs text-gray-400 ml-auto">
                {totalToday} booked today
              </span>

            </div>

            {/* NOW SERVING */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">

              <p className="text-xs text-gray-500">Now Serving</p>

              <p className="text-2xl font-bold text-blue-600">
                {currentToken ?? "—"}
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

            <h2 className="text-lg font-bold">Walk-in Patient</h2>

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