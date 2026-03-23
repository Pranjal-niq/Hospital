import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const today = () => new Date().toISOString().split("T")[0]

const normalize = (name: string) =>
  name.replace("Dr.", "").replace("Dr ", "").trim()

const cleanDoctor = (name: string) => `Dr ${normalize(name)}`

export async function GET() {
  const { data, error } = await supabase
    .from("queue")
    .select("doctor, token")
    .eq("date", today())

  if (error) {
    console.error("Queue GET error:", error)
    return NextResponse.json({})
  }

  const result: Record<string, string | null> = {}
  data?.forEach((row) => {
    result[row.doctor] = row.token
  })

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const { doctor, token } = await req.json()
  const clean = cleanDoctor(doctor)

  const { error } = await supabase
    .from("queue")
    .upsert(
      { doctor: clean, token, date: today() },
      { onConflict: "doctor,date" }
    )

  if (error) {
    console.error("Queue POST error:", error)
    return NextResponse.json({ error: "Failed to update queue" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const { doctor } = await req.json()

  if (doctor) {
    const clean = cleanDoctor(doctor)
    await supabase
      .from("queue")
      .update({ token: null })
      .eq("doctor", clean)
      .eq("date", today())
  } else {
    await supabase
      .from("queue")
      .update({ token: null })
      .eq("date", today())
  }

  return NextResponse.json({ success: true })
}
