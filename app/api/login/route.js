import { NextResponse } from "next/server"

const users = {

  reception: {
    password: "patiladmin",
    role: "reception"
  },

  rajesh: {
    password: "rajesh123",
    role: "doctor",
    doctorName: "Dr Rajesh Patil"
  },

  sunita: {
    password: "sunita123",
    role: "doctor",
    doctorName: "Dr Sunita Deshmukh"
  },

  mohan: {
    password: "mohan123",
    role: "doctor",
    doctorName: "Dr Mohan Kulkarni"
  }

}

export async function POST(req){

  const { username, password } = await req.json()

  const user = users[username]

  if(!user || user.password !== password){

    return NextResponse.json(
      { error:"Invalid credentials" },
      { status:401 }
    )

  }

  const response = NextResponse.json({
    success:true,
    role:user.role,
    doctor:user.doctorName || null
  })

  response.cookies.set("auth","true",{ httpOnly:true, path:"/" })
  response.cookies.set("role",user.role,{ httpOnly:true, path:"/" })
  response.cookies.set("username",username,{ httpOnly:true, path:"/" })

  if(user.role === "doctor"){
    response.cookies.set("doctor",user.doctorName,{ httpOnly:true, path:"/" })
  }

  return response
}