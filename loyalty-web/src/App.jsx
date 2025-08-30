import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Wallet from './pages/Wallet.jsx'
import Redeem from './pages/Redeem.jsx'
import Profile from './pages/user/Profile.jsx'
import Promotions from './pages/merchant/Promotions.jsx'
import Transactions from './pages/merchant/Transactions.jsx'
import UsersAdmin from './pages/admin/UsersAdmin.jsx'
import Nav from './components/Nav.jsx'

const authed = () => !!localStorage.getItem('token')
const role = () => localStorage.getItem('role') || 'user'

function Guard({ allow, children }) {
  if (!authed()) return <Navigate to="/login" />
  return allow.includes(role()) ? children : <Navigate to="/" />
}

export default function App(){
  return (
    <>
      {authed() && <Nav/>}
      <Routes>
        <Route path="/signup" element={<Signup/>} />
        <Route path="/login" element={<Login/>} />
        {/* User */}
        <Route path="/" element={<Guard allow={['user','merchant','admin']}><Wallet/></Guard>} />
        <Route path="/redeem" element={<Guard allow={['user']}><Redeem/></Guard>} />
        <Route path="/profile" element={<Guard allow={['user','merchant','admin']}><Profile/></Guard>} />
        {/* Merchant */}
        <Route path="/merchant/promos" element={<Guard allow={['merchant']}><Promotions/></Guard>} />
        <Route path="/merchant/transactions" element={<Guard allow={['merchant']}><Transactions/></Guard>} />
        {/* Admin */}
        <Route path="/admin/users" element={<Guard allow={['admin']}><UsersAdmin/></Guard>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

