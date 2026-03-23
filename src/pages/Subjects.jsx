import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const Subjects = () => {
  const [subjects, setSubjects] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '', level: 'L1', field: '',
    planned_hours: '', departmentId: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [subjectsRes, deptsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/departments')
      ])
      setSubjects(subjectsRes.data)
      setDepartments(deptsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('/subjects', {
        ...form,
        planned_hours: parseFloat(form.planned_hours),
        departmentId: parseInt(form.departmentId)
      })
      setSuccess('Matière créée avec succès !')
      setShowForm(false)
      setForm({ name: '', level: 'L1', field: '', planned_hours: '', departmentId: '' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette matière ?')) return
    try {
      await api.delete(`/subjects/${id}`)
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
          <h1 style={styles.title}>Matières</h1>
          <button onClick={() => setShowForm(!showForm)} style={styles.btnAdd}>
            {showForm ? 'Annuler' : '+ Ajouter'}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successMsg}>{success}</div>}

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Nouvelle matière</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Intitulé</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Filière</label>
                  <input name="field" value={form.field} onChange={handleChange}
                    style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Niveau</label>
                  <select name="level" value={form.level} onChange={handleChange} style={styles.input}>
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                    <option value="M1">M1</option>
                    <option value="M2">M2</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Volume horaire prévu</label>
                  <input name="planned_hours" type="number" value={form.planned_hours}
                    onChange={handleChange} style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Département</label>
                  <select name="departmentId" value={form.departmentId}
                    onChange={handleChange} style={styles.input} required>
                    <option value="">-- Choisir --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" style={styles.btnSubmit}>Créer la matière</button>
            </form>
          </div>
        )}

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Intitulé</th>
                <th style={styles.th}>Filière</th>
                <th style={styles.th}>Niveau</th>
                <th style={styles.th}>Volume prévu</th>
                <th style={styles.th}>Département</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.empty}>Aucune matière</td>
                </tr>
              ) : (
                subjects.map(s => (
                  <tr key={s.id}>
                    <td style={styles.td}>{s.name}</td>
                    <td style={styles.td}>{s.field}</td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{s.level}</span>
                    </td>
                    <td style={styles.td}>{s.planned_hours}h</td>
                    <td style={styles.td}>{s.department?.name}</td>
                    <td style={styles.td}>
                      <button onClick={() => handleDelete(s.id)} style={styles.btnDelete}>
                        Supprimer
                      </button>
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
    page: { 
  minHeight: '100vh', 
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a202c' },
  btnAdd: { backgroundColor: '#3182ce', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  error: { backgroundColor: '#fff5f5', color: '#c53030', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fed7d7' },
  successMsg: { backgroundColor: '#f0fff4', color: '#276749', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #c6f6d5' },
  formCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  formTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#4a5568' },
  input: { padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem' },
  btnSubmit: { backgroundColor: '#38a169', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', alignSelf: 'flex-start' },
  tableCard: { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#edf2f7', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#4a5568', fontWeight: '600' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#2d3748' },
  empty: { textAlign: 'center', padding: '2rem', color: '#a0aec0' },
  badge: { backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' },
  btnDelete: { backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }
}

export default Subjects