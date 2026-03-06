import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import * as XLSX from "xlsx"

const dataDir = path.join(process.cwd(), "data")
const filePath = path.join(dataDir, "bookings.xlsx")

const normalize = (name:string)=>
  name.replace("Dr.","").replace("Dr ","").trim().toLowerCase()

export async function POST(req:Request){

  try{

    const { doctor } = await req.json()

    if(!fs.existsSync(filePath)){
      return NextResponse.json({success:true})
    }

    const buffer = fs.readFileSync(filePath)

    const workbook = XLSX.read(buffer,{type:"buffer"})

    const sheetName = workbook.SheetNames[0]

    const sheet = workbook.Sheets[sheetName]

    let data:any[] = XLSX.utils.sheet_to_json(sheet)

    const today = new Date().toISOString().split("T")[0]

    // REMOVE TODAY BOOKINGS FOR DOCTOR
    data = data.filter((b:any)=>{

      const sameDoctor =
        normalize(b.Doctor) === normalize(doctor)

      const sameDay =
        b.Date === today

      return !(sameDoctor && sameDay)

    })

    const newSheet = XLSX.utils.json_to_sheet(data)

    const newWorkbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(newWorkbook,newSheet,"Bookings")

    const newBuffer = XLSX.write(newWorkbook,{
      type:"buffer",
      bookType:"xlsx"
    })

    fs.writeFileSync(filePath,newBuffer)

    return NextResponse.json({success:true})

  }catch(err){

    console.error(err)

    return NextResponse.json(
      {error:"Failed to clear bookings"},
      {status:500}
    )

  }

}