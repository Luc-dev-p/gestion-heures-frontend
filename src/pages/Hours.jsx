import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const Hours = () => {
  const [hours, setHours] = useState([])
  const [teacherSubjects, setTeacherSubjects] = useState([])
  const [hourTypes, setHourTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    teacherSubjectId: '',
    hourTypeId: '',
    date: '',
    start_time: '',
    end_time: '',
    room: '',
    note: '',
    academicYearId: 1
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [hoursRes, tsRes, htRes] = await Promise.all([
        api.get('/hours'),
        api.get('/hours/teacher-subjects'),
        api.get('/hours/hour-types')
      ])
      setHours(hoursRes.data)
      setTeacherSubjects(tsRes.data)
      setHourTypes(htRes.data)
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

    const start = new Date(`${form.date}T${form.start_time}`)
    const end = new Date(`${form.date}T${form.end_time}`)

    try {
      await api.post('/hours', {
        teacherSubjectId: parseInt(form.teacherSubjectId),
        hourTypeId: parseInt(form.hourTypeId),
        date: new Date(form.date).toISOString(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        room: form.room,
        note: form.note,
        academicYearId: parseInt(form.academicYearId)
      })
      setSuccess('Heure enregistrée avec succès !')
      setShowForm(false)
      setForm({
        teacherSubjectId: '', hourTypeId: '', date: '',
        start_time: '', end_time: '', room: '', note: '', academicYearId: 1
      })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/hours/${id}/status`, { status })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette entrée ?')) return
    try {
      await api.delete(`/hours/${id}`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression')
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
        <div style={styles.header}>
          <h1 style={styles.title}>Heures effectuées</h1>
          <button onClick={() => setShowForm(!showForm)} style={styles.btnAdd}>
            {showForm ? 'Annuler' : '+ Ajouter'}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successMsg}>{success}</div>}

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Nouvelle entrée d'heures</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Enseignant / Matière</label>
                  <select name="teacherSubjectId" value={form.teacherSubjectId}
                    onChange={handleChange} style={styles.input} required>
                    <option value="">-- Choisir --</option>
                    {teacherSubjects.map(ts => (
                      <option key={ts.id} value={ts.id}>
                        {ts.teacher.firstname} {ts.teacher.lastname} — {ts.subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Type d'heure</label>
                  <select name="hourTypeId" value={form.hourTypeId}
                    onChange={handleChange} style={styles.input} required>
                    <option value="">-- Choisir --</option>
                    {hourTypes.map(ht => (
                      <option key={ht.id} value={ht.id}>
                        {ht.name} (coeff: {ht.coefficient})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Date</label>
                  <input name="date" type="date" value={form.date}
                    onChange={handleChange} style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Heure début</label>
                  <input name="start_time" type="time" value={form.start_time}
                    onChange={handleChange} style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Heure fin</label>
                  <input name="end_time" type="time" value={form.end_time}
                    onChange={handleChange} style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Salle</label>
                  <input name="room" value={form.room}
                    onChange={handleChange} style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Observation</label>
                  <input name="note" value={form.note}
                    onChange={handleChange} style={styles.input} />
                </div>
              </div>
              <button type="submit" style={styles.btnSubmit}>Enregistrer</button>
            </form>
          </div>
        )}

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Enseignant</th>
                <th style={styles.th}>Matière</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Durée</th>
                <th style={styles.th}>Salle</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hours.length === 0 ? (
                <tr>
                  <td colSpan={8} style={styles.empty}>Aucune entrée</td>
                </tr>
              ) : (
                hours.map(h => (
                  <tr key={h.id}>
                    <td style={styles.td}>
                      {h.teacherSubject.teacher.firstname} {h.teacherSubject.teacher.lastname}
                    </td>
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
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {h.status === 'DRAFT' && (
                          <button onClick={() => handleStatusChange(h.id, 'VALIDATED')}
                            style={styles.btnValidate}>
                            Valider
                          </button>
                        )}
                        {h.status === 'VALIDATED' && (
                          <button onClick={() => handleStatusChange(h.id, 'PAID')}
                            style={styles.btnPay}>
                            Payer
                          </button>
                        )}
                        {h.status === 'DRAFT' && (
                          <button onClick={() => handleDelete(h.id)}
                            style={styles.btnDelete}>
                            Supprimer
                          </button>
                        )}
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
  actions: { display: 'flex', gap: '0.5rem' },
  btnValidate: { backgroundColor: '#f0fff4', color: '#276749', border: '1px solid #c6f6d5', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnPay: { backgroundColor: '#ebf8ff', color: '#2a69ac', border: '1px solid #bee3f8', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  btnDelete: { backgroundColor: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7', padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }
}

export default Hours