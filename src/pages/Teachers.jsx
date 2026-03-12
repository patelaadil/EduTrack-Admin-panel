import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Lock, Check, Video, BarChart2, FileText } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useTeachers, useClasses } from '../hooks/useData'
import { Card, Avatar, Badge, Chip, Input, Select, Btn, Modal } from '../components/UI'

export default function TeachersPage() {
  const { data: teachers, loading, refetch } = useTeachers()
  const { data: classes } = useClasses()
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')
  const [form, setForm]       = useState({ name: '', email: '', phone: '', class_id: '', can_add_videos: true, can_add_marks: true, can_add_reports: true })

  const filtered = teachers.filter(t =>
    t.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleAddTeacher() {
    if (!form.name || !form.email) return
    setSaving(true)
    const profileId = crypto.randomUUID()
    const { error: profErr } = await supabase.from('profiles').insert({
      id: profileId, role: 'teacher', name: form.name,
      email: form.email, phone: form.phone, is_active: true
    })
    if (!profErr) {
      const { data: teacher } = await supabase.from('teachers').insert({
        profile_id: profileId,
        can_add_videos: form.can_add_videos,
        can_add_marks: form.can_add_marks,
        can_add_reports: form.can_add_reports,
      }).select().single()

      if (teacher && form.class_id) {
        await supabase.from('teacher_classes').insert({ teacher_id: teacher.id, class_id: form.class_id })
      }
      refetch()
      setShowAdd(false)
      setForm({ name: '', email: '', phone: '', class_id: '', can_add_videos: true, can_add_marks: true, can_add_reports: true })
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this teacher?')) return
    await supabase.from('teachers').delete().eq('id', id)
    refetch()
  }

  return (
    <div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Teacher">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Full Name" placeholder="Teacher name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <Input label="Email" type="email" placeholder="email@school.edu" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <Input label="Phone Number" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <Select label="Assign Class" value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})}
            options={[{ value: '', label: 'Select class...' }, ...classes.map(c => ({ value: c.id, label: c.name }))]} />
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.textGray, display: 'block', marginBottom: 10 }}>Permissions</label>
            <div style={{ display: 'flex', gap: 16 }}>
              {[['can_add_videos','Can Add Videos'], ['can_add_marks','Can Add Marks'], ['can_add_reports','Can Add Reports']].map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.textDark, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form[key]} onChange={e => setForm({...form, [key]: e.target.checked})} style={{ accentColor: C.primary }} /> {label}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Btn variant="primary" style={{ flex: 1 }} icon={Check} onClick={handleAddTeacher} disabled={saving}>{saving ? 'Saving...' : 'Save Teacher'}</Btn>
            <Btn variant="outline" onClick={() => setShowAdd(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>

      <Card style={{ marginBottom: 16, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textDark }}>Teachers</h2>
          <Badge label={`${teachers.length} total`} color={C.purple} />
          <div style={{ flex: 1 }} />
          <Input placeholder="Search teachers..." icon={Search} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
          <Btn icon={Plus} variant="primary" onClick={() => setShowAdd(true)}>Add Teacher</Btn>
        </div>
      </Card>

      <Card style={{ padding: 0 }}>
        {loading
          ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>Loading teachers...</div>
          : filtered.length === 0
            ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>No teachers found.</div>
            : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {['Teacher', 'Email', 'Phone', 'Classes', 'Permissions', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textGray, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? '#fff' : '#FAFBFD' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={t.profiles?.name || '?'} size={32} color={C.purple} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{t.profiles?.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.textGray }}>{t.profiles?.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: C.textGray }}>{t.profiles?.phone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {t.teacher_classes?.map((tc, j) => <Chip key={j} label={tc.classes?.name} color={C.purple} />) || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Video size={13} color={t.can_add_videos ? C.success : C.border} />
                      <BarChart2 size={13} color={t.can_add_marks ? C.success : C.border} />
                      <FileText size={13} color={t.can_add_reports ? C.success : C.border} />
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}><Badge label={t.profiles?.is_active ? 'Active' : 'Inactive'} color={t.profiles?.is_active ? C.success : C.textGray} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, padding: 4 }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
