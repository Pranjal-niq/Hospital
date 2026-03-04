import { NextResponse } from "next/server"
import path from "path"
import ExcelJS from "exceljs"

export const runtime = "nodejs"

const filePath = path.join(process.cwd(), "data", "bookings.xlsx")

export async function GET(){

  const workbook = new ExcelJS.Workbook()

  await workbook.xlsx.readFile(filePath)

  const sheet = workbook.getWorksheet("Bookings")

  if(!sheet) return NextResponse.json([])

  const rows:any[] = []

  const today = new Date().toISOString().split("T")[0]

  sheet.eachRow((row,rowNumber)=>{

    if(rowNumber === 1) return

    const bookingNo = row.getCell(1).value
    const doctor = row.getCell(2).value
    const patient = row.getCell(3).value
    const createdAt = row.getCell(7).value

    if(!createdAt) return

    const bookingDate = new Date(createdAt.toString())
      .toISOString()
      .split("T")[0]

    if(bookingDate === today){

      rows.push({
        bookingNo,
        doctor,
        patient
      })

    }

  })

  return NextResponse.json(rows)

}