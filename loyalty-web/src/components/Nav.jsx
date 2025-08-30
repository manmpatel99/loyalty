export default function Nav(){
  const r = localStorage.getItem('role') || 'user'
  return (
    <nav className="p-3 border-b flex gap-4">
      <a href="/">Wallet</a>
      <a href="/redeem">Redeem</a>
      <a href="/profile">Profile</a>
      {r==='merchant' && (<>
        <a href="/merchant/promos">Promos</a>
        <a href="/merchant/transactions">Transactions</a>
      </>)}
      {r==='admin' && <a href="/admin/users">Users</a>}
      <button className="ml-auto" onClick={()=>{localStorage.clear(); location.href='/login'}}>Logout</button>
    </nav>
  )
}

