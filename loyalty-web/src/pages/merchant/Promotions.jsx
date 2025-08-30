import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'

export default function Promotions(){
  const qc = useQueryClient()
  const { data:promos=[] } = useQuery({ queryKey:['promos'], queryFn: async()=> (await api.get('/promos')).data })
  const [name,setName]=useState(''); const [value,setValue]=useState(1); const [kind,setKind]=useState('multiplier')

  const create = useMutation({
    mutationFn: async()=> (await api.post('/promos',{ name, kind, value, categoryIn:['grocery'], membersOnly:false, startsAt:new Date().toISOString(), endsAt:new Date(Date.now()+7*864e5).toISOString(), active:true })).data,
    onSuccess: ()=> { qc.invalidateQueries({queryKey:['promos']}); setName(''); setValue(1) }
  })

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Promotions</h1>
      <div className="flex gap-2">
        <input className="border p-2 rounded" placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/>
        <select className="border p-2 rounded" value={kind} onChange={e=>setKind(e.target.value)}>
          <option value="multiplier">multiplier</option><option value="flat_bonus">flat_bonus</option>
        </select>
        <input className="border p-2 rounded w-24" type="number" step="0.1" value={value} onChange={e=>setValue(parseFloat(e.target.value||'1'))}/>
        <button className="bg-black text-white px-4 rounded" onClick={()=>create.mutate()}>Create</button>
      </div>
      <ul className="space-y-2">
        {promos.map(p=>(
          <li key={p._id} className="border p-3 rounded-xl flex justify-between">
            <span>{p.name} • {p.kind}={p.value}</span>
            <span className="text-sm text-gray-500">{new Date(p.startsAt).toLocaleDateString()} → {new Date(p.endsAt).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}