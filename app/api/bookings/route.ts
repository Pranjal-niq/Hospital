import { NextResponse } from "next/server"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"
import { nanoid } from "nanoid"

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
})

const doc = new GoogleSpreadsheet(
  process.env.GOOGLE_SHEET_ID!,
  serviceAccountAuth
)

export async function POST(req: Request) {

  try {

    const { doctor, name, phone } = await req.json()

    const bookingNo = `APT-${nanoid(4).toUpperCase()}`

    await doc.loadInfo()

    const sheet = doc.sheetsByIndex[0]

    await sheet.addRow({
      Date: new Date().toLocaleDateString(),
      Token: bookingNo,
      Doctor: doctor,
      Patient: name,
      Phone: phone
    })

    return NextResponse.json({ bookingNo })

  } catch (err) {

    console.error("BOOKING ERROR:", err)

    return NextResponse.json(
      { error: "booking failed" },
      { status: 500 }
    )

  }

}