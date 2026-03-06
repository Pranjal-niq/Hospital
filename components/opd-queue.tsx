"use client"

import { useEffect, useState } from "react"

type QueueType = Record<string, string | null>

type AvailabilityType = Record<
  string,
  {
    available: boolean
  }
>

export default function OpdQueue(){

  const [queue,setQueue] = useState<QueueType>({})
  const [availability,setAvailability] = useState<AvailabilityType>({})

  const fetchData = async ()=>{

    const [queueRes,availabilityRes] = await Promise.all([
      fetch("/api/queue"),
      fetch("/api/doctor-availability")
    ])

    const queueData = await queueRes.json()
    const availabilityData = await availabilityRes.json()

    setQueue(queueData)
    setAvailability(availabilityData)

  }

  useEffect(()=>{

    fetchData()

    const interval = setInterval(fetchData,5000)

    return ()=>clearInterval(interval)

  },[])

  const doctors = Object.keys(availability)

  return(

    <section className="py-20 bg-gray-50">

      <div className="max-w-6xl mx-auto px-4">

        <h2 className="text-3xl font-bold text-center mb-12">
          Live OPD Queue
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          {doctors.map((doctor)=>{

            const token = queue[doctor]

            return(

              <div
                key={doctor}
                className="bg-white border rounded-xl p-6 text-center shadow-sm"
              >

                <h3 className="font-semibold mb-3">
                  {doctor}
                </h3>

                <p className="text-3xl font-bold text-green-600">
                  {token ?? "Waiting"}
                </p>

              </div>

            )

          })}

        </div>

      </div>

    </section>

  )
}