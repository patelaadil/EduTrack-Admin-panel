import { useState } from 'react'
import { Search, Plus, Eye, Edit2, Trash2, Download, Upload, Check, QrCode, Loader } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useStudents, useClasses } from '../hooks/useData'
import { Card, Avatar, Badge, Chip, Input, Select, Btn, Modal } from '../components/UI'

export default function StudentsPage() {
  const { data: students, loading, refetch } = useStudents()
  const { data: classes }                    = useClasses()
  const [search, setSearch]       = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [showAdd, setShowAdd]     = useState(false)
  const [viewStudent, setViewStudent] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState({ name: '', roll_number: '', dob: '', class_id: '', phone: '' })

  const filtered = students.filter(s => {
    const name = s.profiles?.name?.toLowerCase() || ''
    const roll = s.roll_number || ''
    const cls  = s.classes?.name || ''
    return (classFilter === 'all' || cls === classFilter) &&
           (name.includes(search.toLowerCase()) || roll.includes(search))
  })

  async function handleAddStudent() {
    if (!form.name || !form.roll_number) return
    setSaving(true)
    // 1. Create auth user (default password = DOB or roll number)
    const defaultPassword = form.dob || form.roll_number
    const email = `${form.roll_number.toLowerCase()}@student.school.edu`

    const { data: authData, error: authErr } = await supabase.auth.admin
      ? { data: null, error: { message: 'Use service role for auth creation' } }
      : { data: null, error: null }

    // For now insert profile + student directly (admin creates via service role in production)
    // This simplified flow works when called from a trusted context
    const profileId = crypto.randomUUID()

    const { error: profErr } = await supabase.from('profiles').insert({
      id: profileId, role: 'student', name: form.name,
      phone: form.phone, is_active: true
    })

    if (!profErr) {
      const activeYear = await supabase.from('academic_years').select('id').eq('is_active', true).single()
      await supabase.from('students').insert({
        profile_id: profileId,
        roll_number: form.roll_number,
        class_id: form.class_id || null,
        dob: form.dob || null,
        academic_year_id: activeYear.data?.id || null,
      })
      refetch()
      setShowAdd(false)
      setForm({ name: '', roll_number: '', dob: '', class_id: '', phone: '' })
    }
    setSaving(false)
  }

  async function handleDelete(uuid) {
    if (!window.confirm('Delete this student?')) return
    await supabase.from('students').delete().eq('uuid', uuid)
    refetch()
  }

  return (
    <div>
      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Student">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Full Name" placeholder="Student name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <Input label="Roll Number" placeholder="e.g. ST042" value={form.roll_number} onChange={e => setForm({...form, roll_number: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Date of Birth" type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
            <Select label="Class" value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})}
              options={[{ value: '', label: 'Select class...' }, ...classes.map(c => ({ value: c.id, label: c.name }))]} />
          </div>
          <Input label="Contact Number" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <div style={{ padding: '12px 16px', background: `${C.primary}08`, border: `1px dashed ${C.primary}40`, borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: C.primary, margin: 0, fontWeight: 500 }}>🔑 UUID auto-generated on save</p>
            <p style={{ fontSize: 12, color: C.primary, margin: '4px 0 0', fontWeight: 500 }}>📱 QR Code auto-generated on save</p>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Btn variant="primary" style={{ flex: 1 }} icon={saving ? Loader : Check} onClick={handleAddStudent} disabled={saving}>
              {saving ? 'Saving...' : 'Save Student'}
            </Btn>
            <Btn variant="outline" onClick={() => setShowAdd(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewStudent} onClose={() => setViewStudent(null)} title="Student Details" width={480}>
        {viewStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16, background: `${C.primary}08`, borderRadius: 12 }}>
              <Avatar name={viewStudent.profiles?.name || '?'} size={56} />
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.textDark }}>{viewStudent.profiles?.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textGray }}>{viewStudent.classes?.name} · Roll {viewStudent.roll_number}</p>
                <Badge label={viewStudent.profiles?.is_active ? 'Active' : 'Inactive'} color={viewStudent.profiles?.is_active ? C.success : C.textGray} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: '12px 14px', background: C.bg, borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: C.textGray, marginBottom: 3 }}>Date of Birth</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{viewStudent.dob || '—'}</div>
              </div>
              <div style={{ padding: '12px 14px', background: C.bg, borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: C.textGray, marginBottom: 3 }}>Contact</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{viewStudent.profiles?.phone || '—'}</div>
              </div>
              <div style={{ padding: '12px 14px', background: `${C.primary}08`, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, gridColumn: 'span 2' }}>
                <QrCode size={28} color={C.primary} />
                <div style={{ fontSize: 11, fontWeight: 600, color: C.primary }}>UUID: {viewStudent.uuid}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="danger" icon={Trash2} onClick={() => { handleDelete(viewStudent.uuid); setViewStudent(null) }}>Delete</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Header */}
      <Card style={{ marginBottom: 16, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textDark }}>Students</h2>
          <Badge label={`${students.length} total`} color={C.primary} />
          <div style={{ flex: 1 }} />
          <Input placeholder="Search name or roll..." icon={Search} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            style={{ padding: '7px 10px', border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: C.textDark, background: '#F8FAFC', outline: 'none', fontFamily: 'inherit' }}>
            <option value="all">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <Btn icon={Plus} variant="primary" onClick={() => setShowAdd(true)}>Add Student</Btn>
        </div>
      </Card>

      {/* Table */}
      <Card style={{ padding: 0 }}>
        {loading
          ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>Loading students...</div>
          : filtered.length === 0
            ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>No students found.</div>
            : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {['Student', 'Roll No', 'Class', 'DOB', 'Contact', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textGray, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.uuid} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? '#fff' : '#FAFBFD', cursor: 'pointer' }} onClick={() => setViewStudent(s)}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={s.profiles?.name || '?'} size={32} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{s.profiles?.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.textGray }}>{s.roll_number}</td>
                  <td style={{ padding: '12px 16px' }}><Chip label={s.classes?.name || '—'} /></td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.textGray }}>{s.dob || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.textGray }}>{s.profiles?.phone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}><Badge label={s.profiles?.is_active ? 'Active' : 'Inactive'} color={s.profiles?.is_active ? C.success : C.textGray} /></td>
                  <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setViewStudent(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.primary, padding: 4 }}><Eye size={14} /></button>
                      <button onClick={() => handleDelete(s.uuid)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, padding: 4 }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 12, color: C.textGray }}>Showing {filtered.length} of {students.length} students</span>
        </div>
      </Card>
    </div>
  )
}
