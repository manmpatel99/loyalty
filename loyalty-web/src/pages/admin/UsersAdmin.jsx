import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'

export default function UsersAdmin(){
  const { data=[], isLoading, error } = useQuery({
    queryKey:['usersAdmin'],
    queryFn: async()=> (await api.get('/users')).data  // backend should guard with requireRole('admin')
  })
  if (isLoading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-600">Need admin access or endpoint not ready.</div>
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-3">Users</h1>
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th className="py-2">Email</th><th>Name</th><th>Role</th><th>Member</th><th>Points</th></tr></thead>
        <tbody>{data.map(u=>(
          <tr key={u._id} className="border-b">
            <td className="py-2">{u.email}</td>
            <td>{u.name}</td>
            <td>{u.role}</td>
            <td>{String(u.member)}</td>
            <td>{u.points}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}
