import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, BookOpen, Clock,
  FileText, Calendar, User, LogOut, Menu, X,
  GraduationCap
} from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'RH', 'TEACHER'] },
    { path: '/teachers', label: 'Enseignants', icon: Users, roles: ['ADMIN', 'RH'] },
    { path: '/subjects', label: 'Matières', icon: BookOpen, roles: ['ADMIN', 'RH'] },
    { path: '/hours', label: 'Heures', icon: Clock, roles: ['ADMIN', 'RH'] },
    { path: '/summary', label: 'Récapitulatif', icon: FileText, roles: ['ADMIN', 'RH'] },
    { path: '/academic-years', label: 'Années', icon: Calendar, roles: ['ADMIN'] },
    { path: '/profile', label: 'Mon Profil', icon: User, roles: ['ADMIN', 'RH', 'TEACHER'] },
  ]

  const filtered = menuItems.filter(item => item.roles.includes(user?.role))

  return (
    <>
      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        width: collapsed ? '70px' : '240px'
      }}>
        {/* Logo */}
        <div style={styles.logo}>
          <GraduationCap size={28} color="#3182ce" />
          {!collapsed && <span style={styles.logoText}>GestionHeures</span>}
        </div>

        {/* Toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={styles.toggleBtn}>
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>

        {/* Menu */}
        <nav style={styles.nav}>
          {filtered.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.menuItem,
                  backgroundColor: active ? '#ebf8ff' : 'transparent',
                  color: active ? '#3182ce' : '#4a5568',
                  justifyContent: collapsed ? 'center' : 'flex-start'
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {!collapsed && <span style={styles.menuLabel}>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div style={styles.footer}>
          {!collapsed && (
            <div style={styles.userInfo}>
              <div style={styles.avatar}>
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div style={styles.userDetails}>
                <span style={styles.userEmail}>{user?.email}</span>
                <span style={styles.userRole}>{user?.role}</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            ...styles.logoutBtn,
            justifyContent: collapsed ? 'center' : 'flex-start'
          }}>
            <LogOut size={18} />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {!collapsed && (
        <div
          style={styles.overlay}
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  )
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    backgroundColor: '#fff',
    boxShadow: '2px 0 10px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.25s ease',
    zIndex: 200,
    overflowX: 'hidden'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.5rem 1.2rem',
    borderBottom: '1px solid #e2e8f0'
  },
  logoText: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1a202c',
    whiteSpace: 'nowrap'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.75rem 1.2rem',
    color: '#718096',
    display: 'flex',
    alignItems: 'center'
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '0.5rem 0.75rem',
    overflowY: 'auto'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.7rem 0.9rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.9rem',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap'
  },
  menuLabel: {
    whiteSpace: 'nowrap'
  },
  footer: {
    padding: '1rem 0.75rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#3182ce',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
    flexShrink: 0
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  userEmail: {
    fontSize: '0.78rem',
    color: '#2d3748',
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  userRole: {
    fontSize: '0.72rem',
    color: '#718096'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.6rem 0.9rem',
    backgroundColor: '#fff5f5',
    color: '#c53030',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: '600',
    width: '100%'
  },
  overlay: {
    display: 'none',
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 199,
    '@media (max-width: 768px)': {
      display: 'block'
    }
  }
}

export default Navbar