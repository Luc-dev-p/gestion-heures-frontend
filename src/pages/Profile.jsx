import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { exportTeacherPDF, exportTeacherExcel } from '../utils/export.js'

const Profile = () => {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [hours, setHours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const meRes = await api.get('/auth/me')
      const teacher = meRes.data.teacher

      if (!teacher) {
        setError('Aucun profil enseignant associé à ce compte.')
        setLoading(false)
        return
      }

      const [summaryRes, hoursRes] = await Promise.all([
        api.get(`/hours/summary/${teacher.id}?academicYearId=1`),
        api.get(`/hours?teacherId=${teacher.id}`)
      ])

      setSummary({ ...summaryRes.data, teacher })
      setHours(hoursRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const statusColor = (status) => {
    if (status === 'VALIDATED') return { bg: '#c6f6d5', color: '#276749' }
    if (status === 'PAID') return { bg: '#bee3f8', color: '#2a69ac' }
    return { bg: '#fefcbf', color: '#744210' }
  }

  if (loading) return <div style={styles.loading}>Chargement...</div>

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <h1 style={styles.title}>Mon Profil</h1>

        {error && <div style={styles.error}>{error}</div>}

        {summary && (
          <>
            {/* Infos enseignant */}
            <div style={styles.profileCard}>
              <div style={styles.avatar}>
                {summary.teacher.firstname[0]}{summary.teacher.lastname[0]}
              </div>
              <div style={styles.profileInfo}>
                <h2 style={styles.name}>
                  {summary.teacher.firstname} {summary.teacher.lastname}
                </h2>
                <div style={styles.metaRow}>
                  <span style={styles.badge}>{summary.teacher.grade}</span>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: summary.teacher.status === 'PERMANENT' ? '#c6f6d5' : '#feebc8',
                    color: summary.teacher.status === 'PERMANENT' ? '#276749' : '#744210'
                  }}>
                    {summary.teacher.status}
                  </span>
                  <span style={styles.email}>{user.email}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={styles.statsGrid}>
              <StatBox label="Heures contractuelles" value={`${summary.contractHours}h`} color="#3182ce" icon="📋" />
              <StatBox label="Total heures effectuées" value={`${summary.totalEquivalentHours.toFixed(2)}h`} color="#805ad5" icon="⏱️" />
              <StatBox label="Heures normales" value={`${summary.normalHours.toFixed(2)}h`} color="#38a169" icon="✅" />
              <StatBox label="Heures complémentaires" value={`${summary.extraHours.toFixed(2)}h`} color="#e53e3e" icon="➕" />
            </div>

            {/* Montant */}
            {summary.totalAmount !== null ? (
              <div style={styles.amountCard}>
                <div style={styles.amountLabel}>Montant total à percevoir</div>
                <div style={styles.amountValue}>
                  {summary.totalAmount.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            ) : (
              <div style={styles.noRate}>
                ⚠️ Aucun taux horaire défini pour cette année académique.
              </div>
            )}
            

            <div style={styles.exportRow}>
              <button
                onClick={() => exportTeacherPDF(summary.teacher, summary, hours)}
                style={styles.btnPDF}
              >
                📄 Télécharger PDF
              </button>
              <button
                onClick={() => exportTeacherExcel(summary.teacher, summary, hours)}
                style={styles.btnExcel}
              >
                📊 Télécharger Excel
              </button>
            </div>

            {/* Historique des heures */}
            <div style={styles.tableCard}>
              <h3 style={styles.tableTitle}>Historique de mes heures</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Matière</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Durée</th>
                    <th style={styles.th}>Salle</th>
                    <th style={styles.th}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {hours.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={styles.empty}>Aucune heure enregistrée</td>
                    </tr>
                  ) : (
                    hours.map(h => (
                      <tr key={h.id}>
                        <td style={styles.td}>{h.teacherSubject.subject.name}</td>
                        <td style={styles.td}>{h.hourType.name}</td>
                        <td style={styles.td}>{new Date(h.date).toLocaleDateString('fr-FR')}</td>
                        <td style={styles.td}>{h.duration}h</td>
                        <td style={styles.td}>{h.room}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            backgroundColor: statusColor(h.status).bg,
                            color: statusColor(h.status).color
                          }}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const StatBox = ({ label, value, color, icon }) => (
  <div style={{ ...styles.statBox, borderLeft: `4px solid ${color}` }}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={{ ...styles.statValue, color }}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
)

const styles = {
  page: {
  minHeight: '100vh',
  width: '100%',
  backgroundColor: '#f7fafc',
  display: 'flex'
},
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  content: { 
  flex: 1,
  padding: '2rem',
  marginLeft: '240px',  // ← espace pour la sidebar
  transition: 'margin-left 0.25s ease',
  minWidth: 0
},
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a202c', marginBottom: '1.5rem' },
  error: { backgroundColor: '#fff5f5', color: '#c53030', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fed7d7' },
  profileCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '1.5rem' },
  avatar: { width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#3182ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', flexShrink: 0 },
  profileInfo: { flex: 1 },
  name: { fontSize: '1.4rem', fontWeight: '700', color: '#1a202c', marginBottom: '0.5rem' },
  metaRow: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
  badge: { backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' },
  email: { color: '#718096', fontSize: '0.9rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statBox: { backgroundColor: '#fff', borderRadius: '8px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statIcon: { fontSize: '1.5rem', marginBottom: '0.4rem' },
  statValue: { fontSize: '1.6rem', fontWeight: '700' },
  statLabel: { color: '#718096', fontSize: '0.82rem', marginTop: '0.3rem' },
  amountCard: { backgroundColor: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' },
  amountLabel: { fontSize: '0.9rem', color: '#276749', fontWeight: '600', marginBottom: '0.5rem' },
  amountValue: { fontSize: '2.2rem', fontWeight: '700', color: '#276749' },
  noRate: { backgroundColor: '#fffaf0', border: '1px solid #fbd38d', borderRadius: '8px', padding: '1rem', color: '#744210', fontSize: '0.9rem', marginBottom: '1.5rem' },
  tableCard: { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  tableTitle: { fontSize: '1rem', fontWeight: '600', color: '#2d3748', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#edf2f7', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#4a5568', fontWeight: '600' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#2d3748' },
  empty: { textAlign: 'center', padding: '2rem', color: '#a0aec0' }
}

export default Profile