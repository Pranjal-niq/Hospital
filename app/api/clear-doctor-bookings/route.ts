import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { doctor } = await req.json()
    const today = new Date().toISOString().split("T")[0]

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("date", today)
      .ilike("doctor", `%${doctor}%`)

    if (error) {
      console.error("Clear bookings error:", error)
      return NextResponse.json(
        { error: "Failed to clear bookings" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to clear bookings" },
      { status: 500 }
    )
  }
}
