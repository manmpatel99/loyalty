import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
function cents(n){ return (n/100).toFixed(2) }

export default function Wallet(){
  const { data, isLoading, error } = useQuery({
    queryKey:['wallet'],
    queryFn: async()=> (await api.get('/wallet')).data
  })

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">Failed to load wallet</div>

  const { balance, lots, vouchers, expiringSoon } = data
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="p-5 rounded-2xl border">
        <h2 className="text-lg font-semibold">Total Points</h2>
        <div className="text-4xl font-bold">{balance}</div>
        <p className="text-sm text-gray-500">Points expire 180 days after each earn.</p>
      </div>

      <div className="p-5 rounded-2xl border">
        <h3 className="text-lg font-semibold mb-2">Active Vouchers</h3>
        {vouchers.length===0 ? <p>No vouchers yet.</p> :
          <ul className="space-y-2">
            {vouchers.map((v,i)=>(
              <li key={i} className="flex items-center justify-between border p-3 rounded-xl">
                <span>Cap ${cents(v.capCents)}</span>
                <span className="text-sm text-gray-500">Expires {new Date(v.expiresAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        }
      </div>

      <div className="p-5 rounded-2xl border">
        <h3 className="text-lg font-semibold mb-2">Expiring Soon (≤ 60 days)</h3>
        <p className="text-sm mb-2 text-gray-600">Points lots: {expiringSoon.points.length} | Vouchers: {expiringSoon.vouchers.length}</p>
        <ul className="grid gap-2">
          {expiringSoon.points.map((l,i)=>(
            <li key={i} className="text-sm border rounded-xl p-2">• {l.remaining} pts — exp {new Date(l.expiresAt).toLocaleDateString()}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
