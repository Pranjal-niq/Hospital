import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import * as XLSX from "xlsx"

type ExcelRow = {
  Token: string
  Doctor: string
  Patient: string
  Date?: string
}

export async function GET() {

  try {

    const bookingsDir = path.join(process.cwd(), "data", "bookings")

    const today = new Date().toISOString().split("T")[0]

    const filePath = path.join(bookingsDir, `${today}.xlsx`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json([])
    }

    const fileBuffer = fs.readFileSync(filePath)

    const workbook = XLSX.read(fileBuffer, { type: "buffer" })

    const sheetName = workbook.SheetNames[0]

    const sheet = workbook.Sheets[sheetName]

    const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet)

    const bookings = rows.map((r) => ({
      bookingNo: r.Token,
      doctor: r.Doctor,
      patient: r.Patient
    }))

    return NextResponse.json(bookings)

  } catch (error) {

    console.error("TODAY BOOKINGS ERROR:", error)

    return NextResponse.json([])

  }

}