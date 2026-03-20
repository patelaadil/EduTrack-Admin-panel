import { useState } from 'react'
import { Eye, Edit2, Trash2, Download, AlertTriangle } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useAttendance, useClasses, useTeachers } from '../hooks/useData'
import { Card, Avatar, Badge, Chip, Btn, Modal } from '../components/UI'

export default function AttendancePage() {
  const { data: sessions, loading, refetch } = useAttendance()
  const { data: classes }  = useClasses()
  const { data: teachers } = useTeachers()

  const [viewDetail, setViewDetail]   = useState(null)
  const [detailRecords, setDetailRecords] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [classFilter, setClassFilter] = useState('all')
  const [dateFilter, setDateFilter]   = useState('')

  // Compute counts from joined attendance_records
  function getCounts(session) {
    const records = session.attendance_records || []
    return {
      present: records.filter(r => r.status === 'present').length,
      absent:  records.filter(r => r.status === 'absent').length,
      late:    records.filter(r => r.status === 'late').length,
      total:   records.length,
    }
  }

  async function openDetail(session) {
    setViewDetail(session)
    setLoadingDetail(true)
    const { data } = await supabase
      .from('attendance_records')
      .select(`
        id, status, scanned_at, note,
        students (
          uuid, roll_number,
          profiles ( name, photo_url )
        )
      `)
      .eq('session_id', session.id)
      .order('students(profiles(name))')
    setDetailRecords(data || [])
    setLoadingDetail(false)
  }

  async function updateStatus(recordId, newStatus) {
    await supabase.from('attendance_records').update({ status: newStatus }).eq('id', recordId)
    // Refresh detail records
    setDetailRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: newStatus } : r))
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this attendance session?')) return
    await supabase.from('attendance_sessions').delete().eq('id', id)
    refetch()
  }

  // Filter sessions
  const filtered = sessions.filter(s => {
    const matchClass = classFilter === 'all' || s.classes?.name === classFilter
    const matchDate  = !dateFilter || s.session_date === dateFilter
    return matchClass && matchDate
  })

  // Low attendance warning — students below threshold
  const lowAttendanceCount = 0 // Would need aggregation query for real count

  const statusColor = { present: C.success, absent: C.error, late: C.warning }

  return (
    <div>
      {/* Detail Modal */}
      <Modal open={!!viewDetail} onClose={() => { setViewDetail(null); setDetailRecords([]) }} title="Session Details" width={580}>
        {viewDetail && (
          <div>
            {/* Summary */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {['present', 'absent', 'late'].map(status => {
                const count = detailRecords.filter(r => r.status === status).length
                return (
                  <div key={status} style={{ padding: '12px 16px', background: `${statusColor[status]}10`, borderRadius: 10, flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: statusColor[status] }}>{count}</div>
                    <div style={{ fontSize: 11, color: C.textGray, textTransform: 'capitalize' }}>{status}</div>
                  </div>
                )
              })}
              <div style={{ padding: '12px 16px', background: C.bg, borderRadius: 10, flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.textDark }}>{detailRecords.length}</div>
                <div style={{ fontSize: 11, color: C.textGray }}>Total</div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: C.textGray, margin: '0 0 12px' }}>
              {viewDetail.classes?.name} · {viewDetail.subject} · {viewDetail.session_date}
            </p>

            {/* Student List */}
            {loadingDetail
              ? <p style={{ textAlign: 'center', color: C.textGray, fontSize: 13 }}>Loading records...</p>
              : detailRecords.length === 0
                ? <p style={{ textAlign: 'center', color: C.textGray, fontSize: 13 }}>No attendance records for this session.</p>
                : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
                  {detailRecords.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: C.bg, borderRadius: 9 }}>
                      <Avatar name={r.students?.profiles?.name || '?'} size={28} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{r.students?.profiles?.name}</span>
                        <span style={{ fontSize: 11, color: C.textGray, marginLeft: 8 }}>{r.students?.roll_number}</span>
                      </div>
                      {/* Status toggle */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        {['present', 'late', 'absent'].map(s => (
                          <button key={s} onClick={() => updateStatus(r.id, s)}
                            style={{ padding: '3px 8px', borderRadius: 6, border: `1.5px solid ${r.status === s ? statusColor[s] : C.border}`, background: r.status === s ? `${statusColor[s]}15` : 'transparent', color: r.status === s ? statusColor[s] : C.textGray, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }

            <Btn variant="primary" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
              onClick={() => setViewDetail(null)}>Done</Btn>
          </div>
        )}
      </Modal>

      {/* Filters */}
      <Card style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textDark }}>Attendance Records</h2>
          <div style={{ flex: 1 }} />
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            style={{ padding: '7px 10px', border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: C.textDark, background: '#F8FAFC', outline: 'none', fontFamily: 'inherit' }}>
            <option value="all">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            style={{ padding: '7px 10px', border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: C.textDark, background: '#F8FAFC', outline: 'none', fontFamily: 'inherit' }} />
          {dateFilter && (
            <button onClick={() => setDateFilter('')}
              style={{ fontSize: 12, color: C.primary, background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
          )}
          <Btn icon={Download} variant="outline">Export PDF</Btn>
          <Btn icon={Download} variant="outline">Export Excel</Btn>
        </div>
      </Card>

      {/* Table */}
      <Card style={{ padding: 0 }}>
        {loading
          ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>Loading attendance records...</div>
          : filtered.length === 0
            ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>
                No attendance sessions found. Teachers mark attendance via the Teacher App.
              </div>
            : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {['Date', 'Class', 'Subject', 'Teacher', 'Present', 'Absent', 'Late', 'Total', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textGray, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const counts = getCounts(s)
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? '#fff' : '#FAFBFD' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: C.textDark }}>{s.session_date}</td>
                    <td style={{ padding: '12px 16px' }}><Chip label={s.classes?.name || '—'} /></td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: C.textGray }}>{s.subject || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: C.textGray }}>{s.teachers?.profiles?.name || '—'}</td>
                    <td style={{ padding: '12px 16px' }}><Badge label={counts.present} color={C.success} /></td>
                    <td style={{ padding: '12px 16px' }}><Badge label={counts.absent}  color={C.error} /></td>
                    <td style={{ padding: '12px 16px' }}><Badge label={counts.late}    color={C.warning} /></td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: C.textGray }}>{counts.total}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openDetail(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.primary, padding: 4 }}><Eye size={14} /></button>
                        <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, padding: 4 }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {filtered.length > 0 && (
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.textGray }}>Showing {filtered.length} sessions</span>
          </div>
        )}
      </Card>
    </div>
  )
}
