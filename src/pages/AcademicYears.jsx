import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const AcademicYears = () => {
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    label: '', startDate: '', endDate: '', is_active: false
  })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/academic-years')
      setYears(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('/academic-years', {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString()
      })
      setSuccess('Année académique créée !')
      setShowForm(false)
      setForm({ label: '', startDate: '', endDate: '', is_active: false })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleActivate = async (id) => {
    try {
      await api.patch(`/academic-years/${id}/activate`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette année ?')) return
    try {
      await api.delete(`/academic-years/${id}`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  if (loading) return <div style={styles.loading}>Chargement...</div>

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Années académiques</h1>
          <button onClick={() => setShowForm(!showForm)} style={styles.btnAdd}>
            {showForm ? 'Annuler' : '+ Ajouter'}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successMsg}>{success}</div>}

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Nouvelle année académique</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Libellé</label>
                  <input name="label" value={form.label} onChange={handleChange}
                    placeholder="ex: 2025-2026" style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Date début</label>
                  <input name="startDate" type="date" value={form.startDate}
                    onChange={handleChange} style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Date fin</label>
                  <input name="endDate" type="date" value={form.endDate}
                    onChange={handleChange} style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Active</label>
                  <input name="is_active" type="checkbox" checked={form.is_active}
                    onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                </div>
              </div>
              <button type="submit" style={styles.btnSubmit}>Créer</button>
            </form>
          </div>
        )}

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Libellé</th>
                <th style={styles.th}>Date début</th>
                <th style={styles.th}>Date fin</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {years.length === 0 ? (
                <tr><td colSpan={5} style={styles.empty}>Aucune année académique</td></tr>
              ) : (
                years.map(y => (
                  <tr key={y.id}>
                    <td style={styles.td}>{y.label}</td>
                    <td style={styles.td}>{new Date(y.startDate).toLocaleDateString('fr-FR')}</td>
                    <td style={styles.td}>{new Date(y.endDate).toLocaleDateString('fr-FR')}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: y.is_active ? '#c6f6d5' : '#edf2f7',
                        color: y.is_active ? '#276749' : '#718096'
                      }}>
                        {y.is_active ? '✅ Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {!y.is_active && (
                          <button onClick={() => handleActivate(y.id)} style={styles.btnActivate}>
                            Activer
                          </button>
                        )}
                        <button onClick={() => handleDelete(y.id)} style={styles.btnDelete}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f7fafc' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  content: { padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a202c' },
  btnAdd: { backgroundColor: '#3182ce', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  error: { backgroundColor: '#fff5f5', color: '#c53030', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fed7d7' },
  successMsg: { backgroundColor: '#f0fff4', color: '#276749', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #c6f6d5' },
  formCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  formTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#4a5568' },
  input: { padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' },
  btnSubmit: { backgroundColor: '#38a169', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', alignSelf: 'flex-start' },
  tableCard: { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#edf2f7', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#4a5568', fontWeight: '600' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#2d3748' },
  empty: { textAlign: 'center', padding: '2rem', color: '#a0aec0' },
  badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' },
  actions: { display: 'flex', gap: '0.5rem' },
  btnActivate: { backgroundColor: '#f0fff4', color: '#276749', border: '1px solid #c6f6d5', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnDelete: { backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }
}

export default AcademicYears