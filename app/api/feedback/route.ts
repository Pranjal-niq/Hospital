import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import * as XLSX from "xlsx"

export async function POST(req:Request){

  try{

    const {name,doctor,rating,comment} = await req.json()

    const dataDir = path.join(process.cwd(),"data")
    const filePath = path.join(dataDir,"feedback.xlsx")

    if(!fs.existsSync(dataDir)){
      fs.mkdirSync(dataDir)
    }

    let data:any[] = []

    if(fs.existsSync(filePath)){

      const buffer = fs.readFileSync(filePath)

      const workbook = XLSX.read(buffer,{type:"buffer"})

      const sheet = workbook.Sheets[workbook.SheetNames[0]]

      data = XLSX.utils.sheet_to_json(sheet)

    }

    data.push({
      Name:name,
      Doctor:doctor,
      Rating:rating,
      Comment:comment,
      Date:new Date().toISOString().split("T")[0]
    })

    const sheet = XLSX.utils.json_to_sheet(data)

    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook,sheet,"Feedback")

    const buffer = XLSX.write(workbook,{
      type:"buffer",
      bookType:"xlsx"
    })

    fs.writeFileSync(filePath,buffer)

    return NextResponse.json({success:true})

  }catch(err){

    console.error(err)

    return NextResponse.json(
      {error:"failed"},
      {status:500}
    )

  }

}