import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { useState, useEffect } from 'react'

export default function Profile(){
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey:['me'], queryFn: async()=> (await api.get('/users/me')).data })
  const [form,setForm]=useState({ name:'', phone:'' })
  useEffect(()=>{ if(data) setForm({ name:data.name||'', phone:data.phone||'' }) },[data])

  const save = useMutation({
    mutationFn: async()=> (await api.patch('/users/me', form)).data,
    onSuccess: ()=> qc.invalidateQueries({ queryKey:['me'] })
  })

  if (isLoading) return <div className="p-6">Loading…</div>
  return (
    <div className="max-w-md mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold">Profile</h1>
      <input className="w-full border p-2 rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
      <input className="w-full border p-2 rounded" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
      <button className="w-full bg-black text-white py-2 rounded" onClick={()=>save.mutate()} disabled={save.isPending}>Save</button>
      <div className="text-sm text-gray-500">Role: {data.role} • Member: {String(data.member)}</div>
    </div>
  )
}

