import { useState } from 'react'
import { Search, Plus, Eye, Edit2, Trash2, Check, QrCode, AlertCircle } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase, SUPABASE_ANON_KEY } from '../lib/supabase'
import { useStudents, useClasses } from '../hooks/useData'
import { Card, Avatar, Badge, Chip, Input, Select, Btn, Modal } from '../components/UI'
import QRCode from 'react-qr-code'

export default function StudentsPage() {
  const { data: students, loading, refetch } = useStudents()
  const { data: classes }                    = useClasses()
  const [search, setSearch]           = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [showAdd, setShowAdd]         = useState(false)
  const [viewStudent, setViewStudent] = useState(null)
  const [editStudent, setEditStudent] = useState(null)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [form, setForm] = useState({ name: '', roll_number: '', dob: '', class_id: '', phone: '' })

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
    setError('')

    const email    = `${form.roll_number.toLowerCase().replace(/\s+/g, '')}@student.school.edu`
    const password = form.dob ? form.dob.replace(/-/g, '') : form.roll_number

    // Get active academic year
    const { data: activeYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('is_active', true)
      .single()

    // Single call to Edge Function — does everything with service role
    const { data, error: fnError } = await supabase.functions.invoke('create-user', {
      body: {
        email,
        password,
        role: 'student',
        name: form.name,
        phone: form.phone,
        roll_number: form.roll_number,
        class_id: form.class_id || null,
        dob: form.dob || null,
        academic_year_id: activeYear?.id || null,
      },
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    })

    if (fnError || data?.error) {
      setError(data?.error || fnError?.message || 'Failed to create student')
      setSaving(false)
      return
    }

    refetch()
    setShowAdd(false)
    setSaving(false)
    
    // Automatically open the view modal to show the QR code
    const { data: newStudent } = await supabase.from('students').select('*, profiles(*), classes(*)').eq('roll_number', form.roll_number).maybeSingle()
    if (newStudent) {
      setViewStudent(newStudent)
    }

    setForm({ name: '', roll_number: '', dob: '', class_id: '', phone: '' })
  }

  async function handleUpdateStudent() {
    if (!editStudent.profiles?.name || !editStudent.roll_number) return
    setSaving(true)
    setError('')

    // Update students table
    const { error: sErr } = await supabase.from('students').update({
      roll_number: editStudent.roll_number,
      dob: editStudent.dob || null,
      class_id: editStudent.class_id || null,
    }).eq('uuid', editStudent.uuid)

    if (sErr) {
      setError(sErr.message)
      setSaving(false)
      return
    }

    // Update profiles table
    if (editStudent.profiles?.id) {
      const { error: pErr } = await supabase.from('profiles').update({
        name: editStudent.profiles.name,
        phone: editStudent.profiles.phone || null,
      }).eq('id', editStudent.profiles.id)

      if (pErr) {
        setError(pErr.message)
        setSaving(false)
        return
      }
    }

    refetch()
    setEditStudent(null)
    setSaving(false)
  }

  const exportQr = (student) => {
    const svg = document.getElementById("qr-canvas");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${student.roll_number}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  async function handleDelete(uuid) {
    if (!window.confirm('Delete this student?')) return
    await supabase.from('students').delete().eq('uuid', uuid)
    refetch()
  }

  return (
    <div>
      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setError('') }} title="Add New Student">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Full Name" placeholder="Student name" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} />
            <Input label="Roll Number" placeholder="e.g. ST042" value={form.roll_number}
              onChange={e => setForm({...form, roll_number: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Date of Birth" type="date" value={form.dob}
              onChange={e => setForm({...form, dob: e.target.value})} />
            <Select label="Class" value={form.class_id}
              onChange={e => setForm({...form, class_id: e.target.value})}
              options={[{ value: '', label: 'Select class...' }, ...classes.map(c => ({ value: c.id, label: c.name }))]} />
          </div>
          <Input label="Contact Number" placeholder="+91 XXXXX XXXXX" value={form.phone}
            onChange={e => setForm({...form, phone: e.target.value})} />
          <div style={{ padding: '12px 16px', background: `${C.primary}08`, border: `1px dashed ${C.primary}40`, borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: C.primary, margin: 0, fontWeight: 500 }}>
              📧 Login: <strong>{form.roll_number ? `${form.roll_number.toLowerCase()}@student.school.edu` : 'roll@student.school.edu'}</strong>
            </p>
            <p style={{ fontSize: 12, color: C.primary, margin: '4px 0 0', fontWeight: 500 }}>
              🔑 Password: <strong>{form.dob ? form.dob.replace(/-/g, '') : form.roll_number || 'YYYYMMDD or roll number'}</strong>
            </p>
          </div>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: `${C.error}10`, border: `1px solid ${C.error}30`, borderRadius: 9 }}>
              <AlertCircle size={14} color={C.error} />
              <span style={{ fontSize: 13, color: C.error }}>{error}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Btn variant="primary" style={{ flex: 1 }} icon={Check} onClick={handleAddStudent} disabled={saving}>
              {saving ? 'Creating...' : 'Save Student'}
            </Btn>
            <Btn variant="outline" onClick={() => { setShowAdd(false); setError('') }}>Cancel</Btn>
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
                <Badge label={viewStudent.profiles?.is_active ? 'Active' : 'Inactive'}
                  color={viewStudent.profiles?.is_active ? C.success : C.textGray} />
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
              <div style={{ padding: '20px', background: `${C.primary}08`, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, gridColumn: 'span 2' }}>
                <div style={{ background: '#fff', padding: 10, borderRadius: 8 }}>
                  <QRCode id="qr-canvas" value={viewStudent.uuid} size={110} level="Q" />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.primary }}>UUID: {viewStudent.uuid}</div>
                <Btn variant="primary" onClick={() => exportQr(viewStudent)} style={{ padding: '6px 16px', fontSize: 13, minHeight: 0 }}>Export PNG</Btn>
              </div>
            </div>
            <Btn variant="danger" icon={Trash2} onClick={() => { handleDelete(viewStudent.uuid); setViewStudent(null) }}>Delete</Btn>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editStudent} onClose={() => { setEditStudent(null); setError('') }} title="Edit Student">
        {editStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Full Name" placeholder="Student name" value={editStudent.profiles?.name || ''}
                onChange={e => setEditStudent({...editStudent, profiles: {...editStudent.profiles, name: e.target.value}})} />
              <Input label="Roll Number" placeholder="e.g. ST042" value={editStudent.roll_number}
                onChange={e => setEditStudent({...editStudent, roll_number: e.target.value})} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Date of Birth" type="date" value={editStudent.dob || ''}
                onChange={e => setEditStudent({...editStudent, dob: e.target.value})} />
              <Select label="Class" value={editStudent.class_id || ''}
                onChange={e => setEditStudent({...editStudent, class_id: e.target.value})}
                options={[{ value: '', label: 'Select class...' }, ...classes.map(c => ({ value: c.id, label: c.name }))]} />
            </div>
            <Input label="Contact Number" placeholder="+91 XXXXX XXXXX" value={editStudent.profiles?.phone || ''}
              onChange={e => setEditStudent({...editStudent, profiles: {...editStudent.profiles, phone: e.target.value}})} />
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: `${C.error}10`, border: `1px solid ${C.error}30`, borderRadius: 9 }}>
                <AlertCircle size={14} color={C.error} />
                <span style={{ fontSize: 13, color: C.error }}>{error}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Btn variant="primary" style={{ flex: 1 }} icon={Check} onClick={handleUpdateStudent} disabled={saving}>
                {saving ? 'Saving...' : 'Update Student'}
              </Btn>
              <Btn variant="outline" onClick={() => { setEditStudent(null); setError('') }}>Cancel</Btn>
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
          <Input placeholder="Search name or roll..." icon={Search} value={search}
            onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
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
                  <td style={{ padding: '12px 16px' }}>
                    <Badge label={s.profiles?.is_active ? 'Active' : 'Inactive'}
                      color={s.profiles?.is_active ? C.success : C.textGray} />
                  </td>
                  <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setViewStudent(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.primary, padding: 4 }}><Eye size={14} /></button>
                      <button onClick={() => setEditStudent(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.warning || '#f59e0b', padding: 4 }}><Edit2 size={14} /></button>
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