import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  const { token } = await req.json()
  const today = new Date().toISOString().split("T")[0]

  await supabase
    .from("bookings")
    .update({ status: "done" })
    .eq("token", token)
    .eq("date", today)

  return NextResponse.json({ success: true })
}