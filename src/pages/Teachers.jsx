import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const Teachers = () => {
  const [teachers, setTeachers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    email: '', password: '', firstname: '', lastname: '',
    grade: 'ASSISTANT', status: 'PERMANENT', departmentId: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [teachersRes, deptsRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/departments')
      ])
      setTeachers(teachersRes.data)
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
      await api.post('/teachers', {
        ...form,
        departmentId: parseInt(form.departmentId)
      })
      setSuccess('Enseignant créé avec succès !')
      setShowForm(false)
      setForm({
        email: '', password: '', firstname: '', lastname: '',
        grade: 'ASSISTANT', status: 'PERMANENT', departmentId: ''
      })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet enseignant ?')) return
    try {
      await api.delete(`/teachers/${id}`)
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
          <h1 style={styles.title}>Enseignants</h1>
          <button onClick={() => setShowForm(!showForm)} style={styles.btnAdd}>
            {showForm ? 'Annuler' : '+ Ajouter'}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successMsg}>{success}</div>}

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Nouvel enseignant</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.grid}>
                <Field label="Prénom" name="firstname" value={form.firstname} onChange={handleChange} />
                <Field label="Nom" name="lastname" value={form.lastname} onChange={handleChange} />
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
                <Field label="Mot de passe" name="password" type="password" value={form.password} onChange={handleChange} />
                <div style={styles.field}>
                  <label style={styles.label}>Grade</label>
                  <select name="grade" value={form.grade} onChange={handleChange} style={styles.input}>
                    <option value="ASSISTANT">Assistant</option>
                    <option value="MAITRE_ASSISTANT">Maître-Assistant</option>
                    <option value="PROFESSEUR">Professeur</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Statut</label>
                  <select name="status" value={form.status} onChange={handleChange} style={styles.input}>
                    <option value="PERMANENT">Permanent</option>
                    <option value="VACATAIRE">Vacataire</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Département</label>
                  <select name="departmentId" value={form.departmentId} onChange={handleChange} style={styles.input} required>
                    <option value="">-- Choisir --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" style={styles.btnSubmit}>Créer l'enseignant</button>
            </form>
          </div>
        )}

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nom complet</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Grade</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Département</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.empty}>Aucun enseignant</td>
                </tr>
              ) : (
                teachers.map(t => (
                  <tr key={t.id}>
                    <td style={styles.td}>{t.firstname} {t.lastname}</td>
                    <td style={styles.td}>{t.user?.email}</td>
                    <td style={styles.td}>{t.grade}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: t.status === 'PERMANENT' ? '#c6f6d5' : '#feebc8',
                        color: t.status === 'PERMANENT' ? '#276749' : '#744210'
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={styles.td}>{t.department?.name}</td>
                    <td style={styles.td}>
                      <button onClick={() => handleDelete(t.id)} style={styles.btnDelete}>
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

const Field = ({ label, name, type = 'text', value, onChange }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>
    <input type={type} name={name} value={value} onChange={onChange}
      style={styles.input} required />
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
  badge: { padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' },
  btnDelete: { backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }
}

export default Teachers