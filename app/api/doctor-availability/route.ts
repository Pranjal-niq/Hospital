import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const normalize = (name: string) =>
  name.replace("Dr.", "").replace("Dr ", "").trim()

const cleanDoctor = (name: string) => `Dr ${normalize(name)}`

export async function GET() {
  const { data, error } = await supabase
    .from("doctor_availability")
    .select("doctor, available, daily_limit")

  if (error) {
    console.error("Availability GET error:", error)
    return NextResponse.json({})
  }

  const result: Record<string, { available: boolean; dailyLimit: number }> = {}
  data?.forEach((row) => {
    result[row.doctor] = {
      available: row.available,
      dailyLimit: row.daily_limit ?? 30
    }
  })

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const { doctor, available, dailyLimit } = await req.json()
  const clean = cleanDoctor(doctor)

  const updateData: any = { doctor: clean }
  if (available !== undefined) updateData.available = available
  if (dailyLimit !== undefined) updateData.daily_limit = dailyLimit

  const { error } = await supabase
    .from("doctor_availability")
    .upsert(updateData, { onConflict: "doctor" })

  if (error) {
    console.error("Availability POST error:", error)
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}