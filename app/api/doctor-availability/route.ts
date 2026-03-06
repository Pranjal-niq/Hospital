import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const filePath = path.join(process.cwd(), "data", "doctor-availability.json")

// Normalize doctor name
const normalize = (name: string) =>
  name.replace("Dr.", "")
      .replace("Dr ", "")
      .trim()

// Ensure data folder + file exist
const ensureFile = () => {

  const dir = path.join(process.cwd(), "data")

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}, null, 2))
  }

}

// GET AVAILABILITY
export async function GET() {

  try {

    ensureFile()

    const data = fs.readFileSync(filePath, "utf-8")

    return NextResponse.json(JSON.parse(data))

  } catch (error) {

    console.error("Availability GET error:", error)

    return NextResponse.json({})

  }

}

// UPDATE AVAILABILITY
export async function POST(req: Request) {

  try {

    ensureFile()

    const { doctor, available } = await req.json()

    let data: any = {}

    const fileData = fs.readFileSync(filePath, "utf-8")

    if (fileData) {
      data = JSON.parse(fileData)
    }

    const cleanDoctor = normalize(doctor)

    // Remove duplicate doctor entries
    for (const key in data) {

      const cleanKey = normalize(key)

      if (cleanKey === cleanDoctor) {
        delete data[key]
      }

    }

    // Save doctor in consistent format
    const doctorName = `Dr ${cleanDoctor}`

    data[doctorName] = { available }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true })

  } catch (error) {

    console.error("Availability POST error:", error)

    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    )

  }

}