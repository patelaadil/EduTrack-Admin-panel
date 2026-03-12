import { useState } from 'react'
import { Plus, Edit2, Trash2, School, Users, Check } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useClasses, useTeachers } from '../hooks/useData'
import { Card, Avatar, Badge, Input, Select, Btn, Modal } from '../components/UI'

export default function ClassesPage() {
  const { data: classes, loading, refetch } = useClasses()
  const { data: teachers } = useTeachers()
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({ name: '', department: '', year: '', teacher_id: '' })

  async function handleAddClass() {
    if (!form.name) return
    setSaving(true)
    const activeYear = await supabase.from('academic_years').select('id').eq('is_active', true).single()
    const { data: cls } = await supabase.from('classes').insert({
      name: form.name, department: form.department,
      year: form.year, academic_year_id: activeYear.data?.id
    }).select().single()

    if (cls && form.teacher_id) {
      await supabase.from('teacher_classes').insert({ teacher_id: form.teacher_id, class_id: cls.id })
    }
    refetch()
    setShowAdd(false)
    setForm({ name: '', department: '', year: '', teacher_id: '' })
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this class?')) return
    await supabase.from('classes').delete().eq('id', id)
    refetch()
  }

  return (
    <div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Class">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Class Name" placeholder="e.g. Class 10-A" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Department" placeholder="e.g. Science" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
            <Input label="Year / Batch" placeholder="e.g. 2025-26" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
          </div>
          <Select label="Assign Teacher" value={form.teacher_id} onChange={e => setForm({...form, teacher_id: e.target.value})}
            options={[{ value: '', label: 'Select teacher...' }, ...teachers.map(t => ({ value: t.id, label: t.profiles?.name || t.id }))]} />
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Btn variant="primary" style={{ flex: 1 }} icon={Check} onClick={handleAddClass} disabled={saving}>{saving ? 'Saving...' : 'Save Class'}</Btn>
            <Btn variant="outline" onClick={() => setShowAdd(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>

      <Card style={{ marginBottom: 16, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textDark }}>Classes / Batches</h2>
          <Badge label={`${classes.length} classes`} color={C.orange} />
          <div style={{ flex: 1 }} />
          <Btn icon={Plus} variant="primary" onClick={() => setShowAdd(true)}>Add Class</Btn>
        </div>
      </Card>

      {loading
        ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>Loading classes...</div>
        : classes.length === 0
          ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>No classes yet. Add one above.</div>
          : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {classes.map(c => {
            const teacherName = c.teacher_classes?.[0]?.teachers?.profiles?.name || 'No teacher assigned'
            return (
              <Card key={c.id} style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: `${C.orange}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <School size={18} color={C.orange} />
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, padding: 4 }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: C.textDark }}>{c.name}</h3>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: C.textGray }}>{c.department || 'No dept'} · {c.year || c.academic_years?.name || '—'}</p>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar name={teacherName} size={22} color={C.purple} />
                  <span style={{ fontSize: 12, color: C.textGray }}>{teacherName}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
