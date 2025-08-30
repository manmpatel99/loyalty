import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
const cents = n => (n/100).toFixed(2)

export default function Transactions(){
  const { data=[], isLoading } = useQuery({
    queryKey:['merchantTx'],
    queryFn: async()=> (await api.get('/transactions?merchant=me')).data
  })
  if (isLoading) return <div className="p-6">Loading…</div>
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-3">Transactions</h1>
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th className="py-2">Time</th><th>Cat</th><th>Amount</th><th>Pts</th><th>Fee</th><th>Status</th></tr></thead>
        <tbody>
          {data.map(t=>(
            <tr key={t._id} className="border-b">
              <td className="py-2">{new Date(t.paidAt).toLocaleString()}</td>
              <td>{t.category}</td>
              <td>${cents(t.amountCents)}</td>
              <td>{t.pointsAwarded}</td>
              <td>${cents(t.feeCents)}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
