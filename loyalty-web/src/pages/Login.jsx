import { useState } from 'react'
import api from '../lib/api'

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [err,setErr]=useState('')
  async function onSubmit(e){
    e.preventDefault()
    setErr('')
    try{
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.user.role)
      location.href = '/'
    }catch(e){ setErr(e.response?.data?.error || 'Login failed') }
  }
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 p-6 rounded-2xl border">
        <h1 className="text-2xl font-bold">Sign in</h1>
        {err && <p className="text-red-600">{err}</p>}
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button className="w-full bg-black text-white py-2 rounded">Login</button>
      </form>
    </div>
  )
}
