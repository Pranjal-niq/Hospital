"use client"

import { useEffect, useState } from "react"

type QueueType = Record<string, string | null>

export default function OpdQueue(){

  const [queue,setQueue] = useState<QueueType>({})

  const fetchQueue = async ()=>{

    const res = await fetch("/api/queue")
    const data = await res.json()

    setQueue(data)

  }

  useEffect(()=>{

    fetchQueue()

    const interval = setInterval(fetchQueue,5000)

    return ()=>clearInterval(interval)

  },[])

  return(

    <section className="py-20 bg-gray-50">

      <div className="max-w-6xl mx-auto px-4">

        <h2 className="text-3xl font-bold text-center mb-12">
          Live OPD Queue
        </h2>

        <div className="grid md:grid-cols-4 gap-6">

          {Object.entries(queue).map(([doctor,token])=>(

            <div
              key={doctor}
              className="bg-white border rounded-xl p-6 text-center shadow-sm"
            >

              <h3 className="font-semibold mb-3">
                {doctor}
              </h3>

              <p className="text-3xl font-bold text-accent">
                {token ?? "Waiting"}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>

  )
}