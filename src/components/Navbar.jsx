import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>📚 Gestion des Heures</div>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        {['ADMIN', 'RH'].includes(user?.role) && (
          <>
            <Link to="/teachers" style={styles.link}>Enseignants</Link>
            <Link to="/subjects" style={styles.link}>Matières</Link>
            <Link to="/hours" style={styles.link}>Heures</Link>
            <Link to="/summary" style={styles.link}>Récapitulatif</Link>
          </>
        )}
        {user?.role === 'ADMIN' && (
        <Link to="/academic-years" style={styles.link}>Années</Link>
        )}
        <Link to="/profile" style={styles.link}>Mon Profil</Link>
      </div>
      <div style={styles.user}>
        <span style={styles.role}>{user?.role}</span>
        <span style={styles.email}>{user?.email}</span>
        <button onClick={handleLogout} style={styles.logout}>Déconnexion</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a202c',
    padding: '0 2rem',
    height: '60px',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  brand: {
    color: '#fff',
    fontWeight: '700',
    fontSize: '1.1rem'
  },
  links: {
    display: 'flex',
    gap: '1.5rem'
  },
  link: {
    color: '#a0aec0',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  role: {
    backgroundColor: '#3182ce',
    color: '#fff',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  email: {
    color: '#a0aec0',
    fontSize: '0.85rem'
  },
  logout: {
    backgroundColor: '#e53e3e',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  }
}

export default Navbar