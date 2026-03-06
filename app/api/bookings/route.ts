import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import * as XLSX from "xlsx"

const dataDir = path.join(process.cwd(), "data")
const bookingsDir = path.join(dataDir, "bookings")

fs.mkdirSync(bookingsDir, { recursive: true })

const today = new Date().toISOString().split("T")[0]

const filePath = path.join(bookingsDir, `${today}.xlsx`)
const availabilityPath = path.join(dataDir, "doctor-availability.json")
const lockPath = path.join(dataDir, "booking.lock")

const normalize = (d: string) =>
  d.replace("Dr.", "").replace("Dr ", "").trim().toLowerCase()

async function waitForUnlock() {
  while (fs.existsSync(lockPath)) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

export async function POST(req: Request) {

  try {

    const { doctor, name, phone } = await req.json()

    const cleanDoctor = normalize(doctor)

    // CHECK DOCTOR AVAILABILITY
    if (fs.existsSync(availabilityPath)) {

      const availabilityRaw = JSON.parse(
        fs.readFileSync(availabilityPath, "utf-8")
      )

      const availability:any = {}

      Object.keys(availabilityRaw).forEach((key) => {
        availability[normalize(key)] = availabilityRaw[key]
      })

      const status = availability[cleanDoctor]

      const isAvailable =
        typeof status === "boolean"
          ? status
          : status?.available

      if (isAvailable === false) {

        return NextResponse.json(
          { error: "Doctor not available today" },
          { status: 400 }
        )

      }

    }

    await waitForUnlock()

    fs.writeFileSync(lockPath, "locked")

    try {

      let data:any[] = []

      if (fs.existsSync(filePath)) {

        const buffer = fs.readFileSync(filePath)

        const workbook = XLSX.read(buffer, { type: "buffer" })

        const sheetName = workbook.SheetNames[0]

        const sheet = workbook.Sheets[sheetName]

        data = XLSX.utils.sheet_to_json(sheet)

      }

      let bookingNo = "APT-001"

      // FILTER BOOKINGS FOR SAME DOCTOR
      const todayDoctorBookings = data.filter(
        (b:any) =>
          b.Date === today &&
          normalize(b.Doctor) === cleanDoctor &&
          /^APT-\d+$/.test(b.Token)
      )

      if (todayDoctorBookings.length > 0) {

        todayDoctorBookings.sort(
          (a:any,b:any)=>
            parseInt(a.Token.split("-")[1]) -
            parseInt(b.Token.split("-")[1])
        )

        const lastToken =
          todayDoctorBookings[todayDoctorBookings.length - 1].Token

        const lastNumber = parseInt(lastToken.split("-")[1])

        const newNumber = lastNumber + 1

        bookingNo = `APT-${String(newNumber).padStart(3,"0")}`

      }

      data.push({
        Date: today,
        Token: bookingNo,
        Doctor: doctor,
        Patient: name,
        Phone: phone
      })

      const sheet = XLSX.utils.json_to_sheet(data)

      const workbook = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(workbook, sheet, "Bookings")

      const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx"
      })

      fs.writeFileSync(filePath, buffer)

      return NextResponse.json({ bookingNo })

    }
    finally {

      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath)
      }

    }

  }
  catch(err) {

    console.error("BOOKING ERROR:", err)

    return NextResponse.json(
      { error:"Booking failed" },
      { status:500 }
    )

  }

}