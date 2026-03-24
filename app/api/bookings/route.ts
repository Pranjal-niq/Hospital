import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const normalize = (d: string) =>
  d.replace("Dr.", "").replace("Dr ", "").trim().toLowerCase()

export async function POST(req: Request) {
  try {
    const { doctor, name, phone } = await req.json()
    const today = new Date().toISOString().split("T")[0]

    // Check doctor availability + daily limit
    const { data: availData } = await supabase
      .from("doctor_availability")
      .select("available, daily_limit, doctor")
      .ilike("doctor", `%${normalize(doctor)}%`)
      .single()

    if (availData?.available === false) {
      return NextResponse.json(
        { error: "Doctor not available today" },
        { status: 400 }
      )
    }

    // Count today's bookings for this doctor
    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("date", today)
      .ilike("doctor", `%${normalize(doctor)}%`)

    const dailyLimit = availData?.daily_limit ?? 30

    if (count !== null && count >= dailyLimit) {
      return NextResponse.json(
        { error: "Appointments full for today" },
        { status: 400 }
      )
    }

    // Get last token number for this doctor today
    const { data: existing } = await supabase
      .from("bookings")
      .select("token")
      .eq("date", today)
      .ilike("doctor", `%${normalize(doctor)}%`)
      .order("id", { ascending: false })
      .limit(1)

    let newNumber = 1
    if (existing && existing.length > 0) {
      const last = existing[0].token
      newNumber = parseInt(last.split("-")[1]) + 1
    }

    const token = `APT-${String(newNumber).padStart(3, "0")}`

    const { error } = await supabase.from("bookings").insert({
      token,
      doctor,
      patient: name,
      phone,
      date: today
    })

    if (error) {
      console.error("Booking insert error:", error)
      return NextResponse.json({ error: "Booking failed" }, { status: 500 })
    }

    return NextResponse.json({ bookingNo: token })

  } catch (err) {
    console.error("BOOKING ERROR:", err)
    return NextResponse.json({ error: "Booking failed" }, { status: 500 })
  }
}