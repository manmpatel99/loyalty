import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
const cents = n => (n/100).toFixed(2)

export default function Wallet(){
  const { data, isLoading, error } = useQuery({
    queryKey:['wallet'],
    queryFn: async()=> (await api.get('/wallet')).data
  })
  if (isLoading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-600">Failed to load wallet</div>

  const { balance, vouchers, expiringSoon } = data
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="p-5 rounded-2xl border">
        <h2 className="text-lg font-semibold">Total Points</h2>
        <div className="text-4xl font-bold">{balance}</div>
      </div>
      <div className="p-5 rounded-2xl border">
        <h3 className="text-lg font-semibold mb-2">Active Vouchers</h3>
        {!vouchers.length ? <p>No vouchers yet.</p> :
          <ul className="space-y-2">
            {vouchers.map(v=>(
              <li key={v._id} className="flex items-center justify-between border p-3 rounded-xl">
                <span>Cap ${cents(v.capCents)}</span>
                <span className="text-sm text-gray-500">Exp {new Date(v.expiresAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>}
      </div>
      <div className="p-5 rounded-2xl border">
        <h3 className="text-lg font-semibold mb-2">Expiring Soon (≤ 60 days)</h3>
        <p className="text-sm text-gray-600">Lots: {expiringSoon.points.length} | Vouchers: {expiringSoon.vouchers.length}</p>
      </div>
    </div>
  )
}
