import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { APP_NAME } from '../config'

export default function Layout() {
  const { usuario, sair } = useAuth()

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="marca">
          {APP_NAME}
        </Link>
        <div className="topbar-usuario">
          <span className="topbar-email">{usuario?.email}</span>
          <Link to="/perfil" className="botao botao-discreto">
            Perfil
          </Link>
          <button type="button" className="botao botao-discreto" onClick={sair}>
            Sair
          </button>
        </div>
      </header>
      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  )
}
