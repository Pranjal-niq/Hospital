"use client"

import { useEffect, useState } from "react"

type QueueType = Record<string, string | null>

export default function QueuePage() {

  const [queue, setQueue] = useState<QueueType>({})
  const [previousQueue, setPreviousQueue] = useState<QueueType>({})

  const fetchQueue = async () => {

    const res = await fetch("/api/queue")
    const data = await res.json()

    setQueue(data)

  }

  useEffect(() => {

    fetchQueue()

    const interval = setInterval(fetchQueue, 3000)

    return () => clearInterval(interval)

  }, [])

  useEffect(() => {

    Object.entries(queue).forEach(([doctor, token]) => {

      const previousToken = previousQueue[doctor]

      if (token && token !== previousToken) {

        const message = `Token ${token} please proceed to ${doctor}`

        const speech = new SpeechSynthesisUtterance(message)

        speech.rate = 0.9
        speech.pitch = 1

        window.speechSynthesis.speak(speech)

      }

    })

    setPreviousQueue(queue)

  }, [queue])

  return (

    <section className="py-20 lg:py-28 bg-muted/30">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">

          <h2 className="text-3xl font-bold sm:text-4xl">
            Live OPD Queue
          </h2>

          <p className="mt-3 text-muted-foreground">
            Current patients being attended by our doctors
          </p>

        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {Object.entries(queue).map(([doctor, token]) => (

            <div
              key={doctor}
              className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition hover:shadow-lg"
            >

              <h3 className="text-lg font-semibold text-foreground mb-2">
                {doctor}
              </h3>

              <p className="text-sm text-muted-foreground mb-6">
                Now Serving
              </p>

              <div className="text-3xl font-bold text-primary">
                {token ?? "Waiting"}
              </div>

            </div>

          ))}

        </div>

      </div>

    </section>

  )
}