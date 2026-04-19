import { useState } from 'react'
import { Edit2, Trash2, Download, Plus, Check } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useMarks, useStudents, useClasses, useTeachers } from '../hooks/useData'
import { Card, Avatar, Badge, Chip, Input, Select, Btn, Modal } from '../components/UI'

export default function MarksPage() {
  const { profile } = useAuth()
  const { data: marks,   loading: marksLoading,   refetch: refetchMarks   } = useMarks()
  const { data: students } = useStudents()
  const { data: classes }  = useClasses()
  const { data: teachers } = useTeachers()

  const [saving, setSaving]     = useState(false)
  const [showAddMark, setShowAddMark] = useState(false)

  const [markForm, setMarkForm] = useState({
    student_uuid: '', class_id: '', subject: '',
    exam_type: 'midterm', marks_obtained: '', total_marks: '', grade: ''
  })

  // ── Add Mark ──────────────────────────────────────────────
  async function handleAddMark() {
    if (!markForm.student_uuid || !markForm.subject || !markForm.marks_obtained) return
    setSaving(true)

    // Find teacher row for current user
    const { data: teacherRow } = await supabase
      .from('teachers').select('id').eq('profile_id', profile?.id).single()

    await supabase.from('marks').insert({
      student_uuid:   markForm.student_uuid,
      class_id:       markForm.class_id || null,
      teacher_id:     teacherRow?.id || null,
      subject:        markForm.subject,
      exam_type:      markForm.exam_type,
      marks_obtained: Number(markForm.marks_obtained),
      total_marks:    Number(markForm.total_marks),
      grade:          markForm.grade || null,
    })
    refetchMarks()
    setShowAddMark(false)
    setMarkForm({ student_uuid: '', class_id: '', subject: '', exam_type: 'midterm', marks_obtained: '', total_marks: '', grade: '' })
    setSaving(false)
  }

  // ── Delete Mark ───────────────────────────────────────────
  async function handleDeleteMark(id) {
    if (!window.confirm('Delete this mark entry?')) return
    await supabase.from('marks').delete().eq('id', id)
    refetchMarks()
  }

  return (
    <div>
      {/* Add Mark Modal */}
      <Modal open={showAddMark} onClose={() => setShowAddMark(false)} title="Add Marks">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select label="Student" value={markForm.student_uuid} onChange={e => setMarkForm({...markForm, student_uuid: e.target.value})}
            options={[{ value: '', label: 'Select student...' }, ...students.map(s => ({ value: s.uuid, label: `${s.profiles?.name} (${s.roll_number})` }))]} />
          <Select label="Class" value={markForm.class_id} onChange={e => setMarkForm({...markForm, class_id: e.target.value})}
            options={[{ value: '', label: 'Select class...' }, ...classes.map(c => ({ value: c.id, label: c.name }))]} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Subject" placeholder="e.g. Mathematics" value={markForm.subject} onChange={e => setMarkForm({...markForm, subject: e.target.value})} />
            <Select label="Exam Type" value={markForm.exam_type} onChange={e => setMarkForm({...markForm, exam_type: e.target.value})}
              options={[
                { value: 'unit_test', label: 'Unit Test' },
                { value: 'midterm',   label: 'Midterm' },
                { value: 'final',     label: 'Final' },
              ]} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Input label="Marks Obtained" type="number" placeholder="42" value={markForm.marks_obtained} onChange={e => setMarkForm({...markForm, marks_obtained: e.target.value})} />
            <Input label="Total Marks"    type="number" placeholder="50" value={markForm.total_marks}    onChange={e => setMarkForm({...markForm, total_marks: e.target.value})} />
            <Input label="Grade"          placeholder="A / B / C"        value={markForm.grade}          onChange={e => setMarkForm({...markForm, grade: e.target.value})} />
          </div>
          <div style={{ padding: '10px 14px', background: `${C.success}08`, border: `1px solid ${C.success}20`, borderRadius: 9 }}>
            <span style={{ fontSize: 12, color: C.success, fontWeight: 500 }}>
              ✓ Percentage auto-calculated by database trigger
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Btn variant="primary" style={{ flex: 1 }} icon={Check} onClick={handleAddMark} disabled={saving}>{saving ? 'Saving...' : 'Save Marks'}</Btn>
            <Btn variant="outline" onClick={() => setShowAddMark(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>

      <Card style={{ padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textDark }}>All Marks</h3>
            <div style={{ flex: 1 }} />
            <Btn icon={Plus} variant="primary" style={{ padding: '6px 14px' }} onClick={() => setShowAddMark(true)}>Add Marks</Btn>
            <Btn icon={Download} variant="outline" style={{ padding: '6px 12px' }}>Export</Btn>
          </div>

          {marksLoading
            ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>Loading marks...</div>
            : marks.length === 0
              ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>No marks entered yet.</div>
              : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['Student', 'Subject', 'Exam Type', 'Score', 'Percentage', 'Grade', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textGray, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marks.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? '#fff' : '#FAFBFD' }}>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={m.students?.profiles?.name || '?'} size={28} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{m.students?.profiles?.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: C.textGray }}>{m.subject}</td>
                    <td style={{ padding: '11px 16px' }}><Chip label={m.exam_type} color={C.purple} /></td>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: C.textDark }}>{m.marks_obtained} / {m.total_marks}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 5, borderRadius: 3, background: C.border, overflow: 'hidden' }}>
                          <div style={{ width: `${m.percentage}%`, height: '100%', background: m.percentage >= 80 ? C.success : m.percentage >= 60 ? C.warning : C.error, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: m.percentage >= 80 ? C.success : m.percentage >= 60 ? C.warning : C.error }}>{m.percentage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      {m.grade && <Badge label={m.grade} color={m.percentage >= 90 ? C.success : m.percentage >= 75 ? C.primary : C.warning} />}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <button onClick={() => handleDeleteMark(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, padding: 4 }}><Trash2 size={13} /></button>
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
