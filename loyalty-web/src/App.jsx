import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Wallet from './pages/Wallet.jsx'
import Redeem from './pages/Redeem.jsx'
import Promotions from './pages/merchant/Promotions.jsx'

function isAuthed(){ return !!localStorage.getItem('token') }
function role(){ return localStorage.getItem('role') || 'user' }

function Private({ children, allow=['user','merchant','admin'] }){
  return isAuthed() && allow.includes(role()) ? children : <Navigate to="/login" />
}

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      {/* Customer */}
      <Route path="/" element={<Private allow={['user','merchant','admin']}><Wallet/></Private>} />
      <Route path="/redeem" element={<Private allow={['user']}><Redeem/></Private>} />
      {/* Merchant */}
      <Route path="/merchant/promos" element={<Private allow={['merchant']}><Promotions/></Private>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
