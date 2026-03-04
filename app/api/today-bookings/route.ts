import { NextResponse } from "next/server"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

const doc = new GoogleSpreadsheet(
  process.env.GOOGLE_SHEET_ID!,
  serviceAccountAuth
)

export async function GET() {

  await doc.loadInfo()

  const sheet = doc.sheetsByIndex[0]

  const rows = await sheet.getRows()

  const today = new Date().toLocaleDateString()

  const bookings = rows
    .filter((r:any) => r.get("Date") === today)
    .map((r:any) => ({
      bookingNo: r.get("Token"),
      doctor: r.get("Doctor"),
      patient: r.get("Patient")
    }))

  return NextResponse.json(bookings)
}