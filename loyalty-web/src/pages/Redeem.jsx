import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export default function Redeem(){
  const qc = useQueryClient()
  const [amount,setAmount]=useState(0)
  const [voucherId,setVoucherId]=useState('')

  const { data:wallet } = useQuery({ queryKey:['wallet'], queryFn: async()=> (await api.get('/wallet')).data })
  const vouchers = wallet?.vouchers ?? []

  const redeem = useMutation({
    mutationFn: async ({ amountCents, voucherId }) => {
      const userId = 'me' // backend uses req.user; client just sends merchant/category/paidAt
      // you still need merchantId, category, paidAt from your checkout context:
      const body = {
        userId: wallet.userId || undefined, // optional if server takes req.user
        merchantId: localStorage.getItem('merchantId'), // set this in your merchant POS flow
        category: 'grocery', // or 'dine_in'
        paidAt: new Date().toISOString(),
        amountCents,
        voucherId
      }
      const { data } = await api.post('/redeem', body)
      // now award points on net amount
      const earnBody = { ...body, amountCents: data.netPayableCents }
      await api.post('/earn', earnBody)
      return data
    },
    onSuccess: ()=> qc.invalidateQueries({ queryKey:['wallet'] })
  })

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Redeem Voucher</h1>
      <input className="w-full border p-2 rounded" type="number" placeholder="Order amount ($)" onChange={e=>setAmount(Math.round(parseFloat(e.target.value||'0')*100))}/>
      <select className="w-full border p-2 rounded" value={voucherId} onChange={e=>setVoucherId(e.target.value)}>
        <option value="">-- Select voucher (optional) --</option>
        {vouchers.map((v,i)=>(
          <option key={i} value={v._id}>${(v.capCents/100).toFixed(2)} cap — exp {new Date(v.expiresAt).toLocaleDateString()}</option>
        ))}
      </select>
      <button
        className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        disabled={amount<=0}
        onClick={()=>redeem.mutate({ amountCents: amount, voucherId: voucherId || undefined })}
      >
        Apply & Award Points
      </button>
      {redeem.isPending && <p>Processing…</p>}
      {redeem.isError && <p className="text-red-600">Failed to redeem</p>}
      {redeem.isSuccess && <p className="text-green-700">Done!</p>}
    </div>
  )
}
