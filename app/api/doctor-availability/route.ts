import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const normalize = (name: string) =>
  name.replace("Dr.", "").replace("Dr ", "").trim()

const cleanDoctor = (name: string) => `Dr ${normalize(name)}`

export async function GET() {
  const { data, error } = await supabase
    .from("doctor_availability")
    .select("doctor, available")

  if (error) {
    console.error("Availability GET error:", error)
    return NextResponse.json({})
  }

  const result: Record<string, { available: boolean }> = {}
  data?.forEach((row) => {
    result[row.doctor] = { available: row.available }
  })

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const { doctor, available } = await req.json()
  const clean = cleanDoctor(doctor)

  const { error } = await supabase
    .from("doctor_availability")
    .upsert(
      { doctor: clean, available },
      { onConflict: "doctor" }
    )

  if (error) {
    console.error("Availability POST error:", error)
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
