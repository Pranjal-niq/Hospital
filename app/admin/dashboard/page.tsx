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

export default function Dashboard(){

  const router = useRouter()

  const [bookings,setBookings] = useState<Booking[]>([])
  const [queue,setQueue] = useState<QueueType>({})
  const [availability,setAvailability] = useState<AvailabilityType>({})

  const [username,setUsername] = useState("")
  const [role,setRole] = useState("")

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
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        doctor,
        available: !current
      })
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
      headers:{
        "Content-Type":"application/json"
      },
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
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        doctor,
        token
      })
    })

    loadQueue()

  }

  const finishToken = async (doctor:string,items:Booking[])=>{

    const currentToken = queue[doctor]

    const currentIndex = items.findIndex(
      b=>b.bookingNo===currentToken
    )

    const nextPatient = items[currentIndex+1]

    if(nextPatient){

      await fetch("/api/queue",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          doctor,
          token:nextPatient.bookingNo
        })
      })

    }else{

      await fetch("/api/queue",{
        method:"DELETE",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          doctor
        })
      })

    }

    loadQueue()

  }

  const resetAll = async ()=>{

    await fetch("/api/queue",{
      method:"DELETE",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({})
    })

    loadQueue()

  }

  const doctors = Object.keys(availability)

  return(

    <div className="max-w-6xl mx-auto py-16 space-y-8">

      <div className="flex justify-between items-center">

        <h1 className="text-xl font-bold">
          Reception Dashboard
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

      {doctors.map((doctor)=>{

        const items = bookings.filter(
          b=>normalize(b.doctor)===normalize(doctor)
        )

        const currentToken = queue[doctor]
        const isAvailable = availability[doctor]?.available ?? true

        return(

          <div key={doctor} className="border rounded-xl p-4 space-y-4">

            <div className="flex justify-between items-center">

              <h2 className="text-lg font-semibold">
                {doctor}
              </h2>

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

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">

              <p className="text-xs text-gray-500">
                Now Serving
              </p>

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

            <div className="space-y-2">

              <p className="text-sm font-medium">
                Waiting Patients
              </p>

              {items.length===0 &&(

                <p className="text-xs text-gray-400">
                  No bookings yet
                </p>

              )}

              {items
                .filter(b=>b.bookingNo!==currentToken)
                .map(b=>(

                  <button
                    key={b.bookingNo}
                    onClick={()=>callToken(b.doctor,b.bookingNo,b.patient)}
                    className="w-full border px-3 py-2 rounded flex justify-between items-center hover:bg-gray-50 transition"
                  >

                    <div className="text-left">

                      <p className="text-sm font-semibold">
                        {b.patient}
                      </p>

                      <p className="text-xs text-gray-500">
                        {b.bookingNo}
                      </p>

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

    </div>

  )

}