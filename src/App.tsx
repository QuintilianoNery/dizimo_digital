import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLogin from './pages/admin/Login'
import AdminSetup from './pages/admin/Setup'
import AdminDashboard from './pages/admin/Dashboard'
import Paroquias from './pages/admin/Paroquias'
import ParoquiaForm from './pages/admin/ParoquiaForm'
import LoginPage from './pages/login/LoginPage'
import ParoquialDashboard from './pages/paroquial/Dashboard'
import Configuracao from './pages/paroquial/Configuracao'
import Cebs from './pages/paroquial/Cebs'
import Pastorais from './pages/paroquial/Pastorais'
import CebDashboard from './pages/ceb/Dashboard'
import Conselheiros from './pages/ceb/Conselheiros'
import Dizimistas from './pages/ceb/Dizimistas'
import Doacoes from './pages/ceb/Doacoes'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/setup" element={<AdminSetup />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin" redirectTo="/admin/login"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/paroquias" element={<ProtectedRoute role="admin" redirectTo="/admin/login"><Paroquias /></ProtectedRoute>} />
      <Route path="/admin/paroquias/nova" element={<ProtectedRoute role="admin" redirectTo="/admin/login"><ParoquiaForm /></ProtectedRoute>} />
      <Route path="/admin/paroquias/:id" element={<ProtectedRoute role="admin" redirectTo="/admin/login"><ParoquiaForm /></ProtectedRoute>} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/paroquial" element={<Navigate to="/paroquial/dashboard" replace />} />
      <Route path="/paroquial/dashboard" element={<ProtectedRoute role="paroquial" redirectTo="/login"><ParoquialDashboard /></ProtectedRoute>} />
      <Route path="/paroquial/configuracao" element={<ProtectedRoute role="paroquial" redirectTo="/login"><Configuracao /></ProtectedRoute>} />
      <Route path="/paroquial/cebs" element={<ProtectedRoute role="paroquial" redirectTo="/login"><Cebs /></ProtectedRoute>} />
      <Route path="/paroquial/pastorais" element={<ProtectedRoute role="paroquial" redirectTo="/login"><Pastorais /></ProtectedRoute>} />

      <Route path="/ceb" element={<Navigate to="/ceb/dashboard" replace />} />
      <Route path="/ceb/dashboard" element={<ProtectedRoute role="ceb" redirectTo="/login"><CebDashboard /></ProtectedRoute>} />
      <Route path="/ceb/conselheiros" element={<ProtectedRoute role="ceb" redirectTo="/login"><Conselheiros /></ProtectedRoute>} />
      <Route path="/ceb/dizimistas" element={<ProtectedRoute role="ceb" redirectTo="/login"><Dizimistas /></ProtectedRoute>} />
      <Route path="/ceb/doacoes" element={<ProtectedRoute role="ceb" redirectTo="/login"><Doacoes /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
