import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import Layout from './components/Layout'
import ChatPage from './pages/ChatPage'
import EditalPage from './pages/EditalPage'
import LoginPage from './pages/LoginPage'
import PerfilPage from './pages/PerfilPage'
import RegistroPage from './pages/RegistroPage'
import SobreNosPage from './pages/SobreNosPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<EditalPage />} />
          <Route path="sobre-nos" element={<SobreNosPage />} />
          <Route path="edital/:id" element={<ChatPage />} />
          <Route path="perfil" element={<PerfilPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
