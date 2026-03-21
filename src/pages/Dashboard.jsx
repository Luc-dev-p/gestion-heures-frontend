import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const Dashboard = () => {
  const [overview, setOverview] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, monthlyRes] = await Promise.all([
          api.get('/dashboard/overview?academicYearId=1'),
          api.get('/dashboard/monthly?academicYearId=1')
        ])
        setOverview(overviewRes.data)
        setMonthly(monthlyRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div style={styles.loading}>Chargement...</div>

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <h1 style={styles.title}>Tableau de bord</h1>

        {overview && (
          <div style={styles.cards}>
            <StatCard label="Enseignants" value={overview.totalTeachers} color="#3182ce" icon="👨‍🏫" />
            <StatCard label="Matières" value={overview.totalSubjects} color="#38a169" icon="📚" />
            <StatCard label="Départements" value={overview.totalDepartments} color="#d69e2e" icon="🏢" />
            <StatCard label="Heures validées" value={overview.totalValidatedHours} color="#805ad5" icon="⏱️" />
            <StatCard label="En attente" value={overview.pendingHours} color="#e53e3e" icon="⏳" />
          </div>
        )}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Statistiques mensuelles</h2>
          {monthly.length === 0 ? (
            <p style={styles.empty}>Aucune donnée disponible</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Mois</th>
                  <th style={styles.th}>Heures équivalentes</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m) => (
                  <tr key={m.month}>
                    <td style={styles.td}>{m.month}</td>
                    <td style={styles.td}>{m.totalEquivalentHours.toFixed(2)}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, color, icon }) => (
  <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
    <div style={styles.cardIcon}>{icon}</div>
    <div style={{ ...styles.cardValue, color }}>{value}</div>
    <div style={styles.cardLabel}>{label}</div>
  </div>
)

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f7fafc' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  content: { padding: '2rem' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a202c', marginBottom: '1.5rem' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  cardIcon: { fontSize: '2rem', marginBottom: '0.5rem' },
  cardValue: { fontSize: '2rem', fontWeight: '700' },
  cardLabel: { color: '#718096', fontSize: '0.9rem', marginTop: '0.3rem' },
  section: { backgroundColor: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  sectionTitle: { fontSize: '1.2rem', fontWeight: '600', color: '#2d3748', marginBottom: '1rem' },
  empty: { color: '#a0aec0', textAlign: 'center', padding: '2rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#edf2f7', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#4a5568' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.95rem' }
}

export default Dashboard