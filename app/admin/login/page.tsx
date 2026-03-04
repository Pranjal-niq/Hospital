"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogin() {

  const [password,setPassword] = useState("")
  const router = useRouter()

  const handleLogin = () => {

    if(password === "patiladmin"){
      localStorage.setItem("adminAuth","true")
      router.push("/admin/dashboard")
    }else{
      alert("Incorrect password")
    }

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-md w-[350px]">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Reception Login
        </h1>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>

      </div>

    </div>

  )
}