import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { exportTeacherPDF, exportTeacherExcel } from '../utils/export.js'

const Summary = () => {
  const [teachers, setTeachers] = useState([])
  const [selected, setSelected] = useState('')
  const [summary, setSummary] = useState(null)
  const [hours, setHours] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/teachers').then(res => setTeachers(res.data))
  }, [])

  const fetchSummary = async (id) => {
    if (!id) return
    setLoading(true)
    setError('')
    setSummary(null)
    setHours([])
    try {
      const [summaryRes, hoursRes] = await Promise.all([
        api.get(`/hours/summary/${id}?academicYearId=1`),
        api.get(`/hours?teacherId=${id}`)
      ])
      setSummary(summaryRes.data)
      setHours(hoursRes.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const teacher = teachers.find(t => t.id === parseInt(selected))

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <h1 style={styles.title}>Récapitulatif des heures</h1>

        <div style={styles.filterCard}>
          <div style={styles.filterRow}>
            <div style={styles.field}>
              <label style={styles.label}>Sélectionner un enseignant</label>
              <select
                value={selected}
                onChange={e => { setSelected(e.target.value); fetchSummary(e.target.value) }}
                style={styles.select}
              >
                <option value="">-- Choisir un enseignant --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.firstname} {t.lastname} — {t.grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {summary && teacher && (
          <div style={styles.summaryCard}>
            {/* En-tête enseignant */}
            <div style={styles.teacherHeader}>
              <div style={styles.avatar}>
                {teacher.firstname[0]}{teacher.lastname[0]}
              </div>
              <div>
                <h2 style={styles.teacherName}>
                  {teacher.firstname} {teacher.lastname}
                </h2>
                <div style={styles.teacherMeta}>
                  <span style={styles.badge}>{teacher.grade}</span>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: teacher.status === 'PERMANENT' ? '#c6f6d5' : '#feebc8',
                    color: teacher.status === 'PERMANENT' ? '#276749' : '#744210'
                  }}>
                    {teacher.status}
                  </span>
                  <span style={styles.dept}>{teacher.department?.name}</span>
                </div>
              </div>
            </div>

            {/* Cartes de stats */}
            <div style={styles.statsGrid}>
              <StatBox label="Heures contractuelles" value={`${summary.contractHours}h`} color="#3182ce" icon="📋" />
              <StatBox label="Total heures équivalentes" value={`${summary.totalEquivalentHours.toFixed(2)}h`} color="#805ad5" icon="⏱️" />
              <StatBox label="Heures normales" value={`${summary.normalHours.toFixed(2)}h`} color="#38a169" icon="✅" />
              <StatBox label="Heures complémentaires" value={`${summary.extraHours.toFixed(2)}h`} color="#e53e3e" icon="➕" />
            </div>

            {/* Détail par type */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Détail par type d'heure</h3>
              {Object.keys(summary.byType).length === 0 ? (
                <p style={styles.empty}>Aucune heure validée</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Heures équivalentes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summary.byType).map(([type, h]) => (
                      <tr key={type}>
                        <td style={styles.td}>
                          <span style={styles.typeBadge}>{type}</span>
                        </td>
                        <td style={styles.td}>{h.toFixed(2)}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Montant total */}
            {summary.totalAmount !== null ? (
              <div style={styles.amountCard}>
                <div style={styles.amountLabel}>Montant total à payer</div>
                <div style={styles.amountValue}>
                  {summary.totalAmount.toLocaleString('fr-FR')} FCFA
                </div>
                <div style={styles.amountDetail}>
                  Heures normales × taux normal + Heures complémentaires × taux complémentaire
                </div>
              </div>
            ) : (
              <div style={styles.noRate}>
                ⚠️ Aucun taux horaire défini pour cet enseignant cette année.
                Définissez-le dans Prisma Studio pour voir le montant.
              </div>
            )}

            {/* Boutons export — EN DEHORS du ternaire */}
            <div style={styles.exportRow}>
              <button
                onClick={() => exportTeacherPDF(teacher, summary, hours)}
                style={styles.btnPDF}
              >
                📄 Exporter PDF
              </button>
              <button
                onClick={() => exportTeacherExcel(teacher, summary, hours)}
                style={styles.btnExcel}
              >
                📊 Exporter Excel
              </button>
            </div>

          </div>
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
  backgroundColor: '#f7fafc',
  display: 'flex'
},
  content: { 
  flex: 1,
  padding: '2rem',
  marginLeft: '240px',  // ← espace pour la sidebar
  transition: 'margin-left 0.25s ease',
  minWidth: 0
},
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a202c', marginBottom: '1.5rem' },
  filterCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  filterRow: { display: 'flex', gap: '1rem', alignItems: 'flex-end' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#4a5568' },
  select: { padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' },
  error: { backgroundColor: '#fff5f5', color: '#c53030', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fed7d7' },
  summaryCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  teacherHeader: { display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' },
  avatar: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#3182ce', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: '700' },
  teacherName: { fontSize: '1.4rem', fontWeight: '700', color: '#1a202c', marginBottom: '0.5rem' },
  teacherMeta: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  badge: { backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' },
  dept: { color: '#718096', fontSize: '0.9rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statBox: { backgroundColor: '#f7fafc', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' },
  statIcon: { fontSize: '1.5rem', marginBottom: '0.4rem' },
  statValue: { fontSize: '1.6rem', fontWeight: '700' },
  statLabel: { color: '#718096', fontSize: '0.82rem', marginTop: '0.3rem' },
  section: { marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.75rem' },
  empty: { color: '#a0aec0', textAlign: 'center', padding: '1rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#edf2f7', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#4a5568', fontWeight: '600' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#2d3748' },
  typeBadge: { backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' },
  amountCard: { backgroundColor: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '10px', padding: '1.5rem', textAlign: 'center' },
  amountLabel: { fontSize: '0.9rem', color: '#276749', fontWeight: '600', marginBottom: '0.5rem' },
  amountValue: { fontSize: '2.2rem', fontWeight: '700', color: '#276749', marginBottom: '0.5rem' },
  amountDetail: { fontSize: '0.8rem', color: '#48bb78' },
  noRate: { backgroundColor: '#fffaf0', border: '1px solid #fbd38d', borderRadius: '8px', padding: '1rem', color: '#744210', fontSize: '0.9rem' },
  exportRow: { display: 'flex', gap: '1rem', marginTop: '1.5rem' },
  btnPDF: { backgroundColor: '#e53e3e', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' },
  btnExcel: { backgroundColor: '#38a169', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }
}

export default Summary