import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("bookings")
      .select("token, doctor, patient")
      .eq("date", today)
      .eq("status", "waiting")
      .order("id", { ascending: true })

    if (error) {
      console.error("Today bookings error:", error)
      return NextResponse.json([])
    }

    return NextResponse.json(
      data?.map(r => ({
        bookingNo: r.token,
        doctor: r.doctor,
        patient: r.patient
      })) ?? []
    )
  } catch (error) {
    console.error("TODAY BOOKINGS ERROR:", error)
    return NextResponse.json([])
  }
}