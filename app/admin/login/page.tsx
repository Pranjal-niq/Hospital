"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogin() {

  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const [role,setRole] = useState("reception")
  const [loading,setLoading] = useState(false)

  const router = useRouter()

  const handleLogin = async () => {

    try{

      setLoading(true)

      const res = await fetch("/api/login",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          username,
          password
        })
      })

      if(!res.ok){
        alert("Invalid login credentials")
        return
      }

      const data = await res.json()

      if(data.success){
        router.push("/admin/dashboard")
      }

    }catch(err){
      console.error(err)
      alert("Login failed")
    }finally{
      setLoading(false)
    }

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-md w-[360px]">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Hospital Login
        </h1>

        <select
          value={role}
          onChange={(e)=>setRole(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="reception">Reception</option>
          <option value="doctor">Doctor</option>
        </select>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </div>

    </div>

  )
}