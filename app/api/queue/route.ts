import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

const filePath = path.join(process.cwd(),"data","queue.json")

function readQueue(){

  if(!fs.existsSync(filePath)){
    return {
      date: new Date().toISOString().split("T")[0],
      doctors: {}
    }
  }

  const raw = fs.readFileSync(filePath,"utf8")
  const data = JSON.parse(raw)

  const today = new Date().toISOString().split("T")[0]

  // AUTO RESET IF DATE CHANGED
  if(data.date !== today){

    const resetData = {
      date: today,
      doctors: {}
    }

    fs.writeFileSync(filePath,JSON.stringify(resetData,null,2))

    return resetData

  }

  return data

}

function writeQueue(data:any){

  fs.writeFileSync(filePath,JSON.stringify(data,null,2))

}

export async function GET(){

  const queueData = readQueue()

  return NextResponse.json(queueData.doctors)

}

export async function POST(req:Request){

  const body = await req.json()

  const { doctor, token } = body

  const queueData = readQueue()

  queueData.doctors[doctor] = token

  writeQueue(queueData)

  return NextResponse.json({ success:true })

}

export async function DELETE(req:Request){

  const body = await req.json()

  const { doctor } = body

  const queueData = readQueue()

  if(doctor){
    queueData.doctors[doctor] = null
  }else{
    Object.keys(queueData.doctors).forEach(d=>{
      queueData.doctors[d] = null
    })
  }

  writeQueue(queueData)

  return NextResponse.json({ success:true })

}