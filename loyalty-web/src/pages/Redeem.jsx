import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'

export default function Redeem(){
  const qc = useQueryClient()
  const [amount,setAmount]=useState('')
  const [voucherId,setVoucherId]=useState('')
  const { data:wallet } = useQuery({ queryKey:['wallet'], queryFn: async()=> (await api.get('/wallet')).data })
  const vouchers = wallet?.vouchers ?? []

  const redeem = useMutation({
    mutationFn: async () => {
      const amountCents = Math.round(parseFloat(amount||'0')*100)
      if (!amountCents) throw new Error('Enter amount')
      // TODO: set these from context/selection:
      const body = { merchantId: localStorage.getItem('merchantId'), userId: null, category: 'grocery', paidAt: new Date().toISOString(), amountCents, voucherId: voucherId || undefined }
      const { data } = await api.post('/redeem', body)
      await api.post('/earn', { ...body, amountCents: data.netPayableCents }) // award on net
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey:['wallet'] })
  })

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Redeem</h1>
      <input className="w-full border p-2 rounded" placeholder="Order amount ($)" value={amount} onChange={e=>setAmount(e.target.value)}/>
      <select className="w-full border p-2 rounded" value={voucherId} onChange={e=>setVoucherId(e.target.value)}>
        <option value="">-- Select voucher (optional) --</option>
        {vouchers.map(v => <option key={v._id} value={v._id}>Cap ${(v.capCents/100).toFixed(2)} — exp {new Date(v.expiresAt).toLocaleDateString()}</option>)}
      </select>
      <button className="w-full bg-black text-white py-2 rounded" onClick={()=>redeem.mutate()} disabled={redeem.isPending}>
        Apply & Award Points
      </button>
      {redeem.isPending && <p>Processing…</p>}
    </div>
  )
}
