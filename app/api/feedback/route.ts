import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { name, doctor, rating, comment } = await req.json()
    const today = new Date().toISOString().split("T")[0]

    const { error } = await supabase.from("feedback").insert({
      name,
      doctor,
      rating,
      comment,
      date: today
    })

    if (error) {
      console.error("Feedback error:", error)
      return NextResponse.json({ error: "Failed" }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
