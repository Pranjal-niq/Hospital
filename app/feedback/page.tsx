"use client"

import { useState } from "react"

export default function FeedbackPage() {

  const [submitted,setSubmitted] = useState(false)
  const [rating,setRating] = useState(0)
  const [comment,setComment] = useState("")
  const [name,setName] = useState("")
  const [doctor,setDoctor] = useState("")

  const submitFeedback = async () => {

    await fetch("/api/feedback",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        name,
        doctor,
        rating,
        comment
      })
    })

    setSubmitted(true)

  }

  if(submitted){

    return(

      <div className="min-h-screen flex items-center justify-center">

        <div className="text-center space-y-4">

          <h1 className="text-2xl font-bold text-green-600">
            Thank you for your feedback ❤️
          </h1>

          <p className="text-gray-500">
            Your feedback helps us improve patient care.
          </p>

        </div>

      </div>

    )

  }

  return(

    <div className="min-h-screen flex items-center justify-center">

      <div className="bg-white shadow-xl rounded-xl p-8 w-[400px] space-y-4">

        <h1 className="text-xl font-semibold text-center">
          Rate Your Experience
        </h1>

        <input
          placeholder="Your Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Doctor Name"
          value={doctor}
          onChange={(e)=>setDoctor(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="flex justify-center gap-2">

          {[1,2,3,4,5].map((star)=>(
            <button
              key={star}
              onClick={()=>setRating(star)}
              className={`text-3xl ${
                star <= rating ? "text-yellow-400":"text-gray-300"
              }`}
            >
              ★
            </button>
          ))}

        </div>

        <textarea
          placeholder="Comment (optional)"
          value={comment}
          onChange={(e)=>setComment(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={submitFeedback}
          className="w-full bg-primary text-white p-2 rounded"
        >
          Submit Feedback
        </button>

      </div>

    </div>

  )

}