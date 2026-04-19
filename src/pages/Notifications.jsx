import { useState } from 'react'
import { Bell, Send, Trash2, Check } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNotifications, useClasses } from '../hooks/useData'
import { Card, Chip, Input, Select, Btn } from '../components/UI'

export default function NotificationsPage() {
  const { profile } = useAuth()
  const { data: notifications, refetch } = useNotifications()
  const { data: classes } = useClasses()
  const [title, setTitle]   = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('all')
  const [classId, setClassId] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]     = useState(false)

  async function handleSend() {
    if (!title || !message) return
    if (target === 'class' && !classId) return
    setSending(true)
    await supabase.from('notifications').insert({
      title, body: message,
      sent_by: profile?.id,
      target_type: target,
      class_id: target === 'class' ? classId : null,
    })
    setSent(true)
    setTitle('')
    setMessage('')
    refetch()
    setTimeout(() => setSent(false), 3000)
    setSending(false)
  }

  async function handleDelete(id) {
    await supabase.from('notifications').delete().eq('id', id)
    refetch()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: C.textDark }}>Send Notification</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Title" placeholder="Notification title" value={title} onChange={e => setTitle(e.target.value)} />
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.textGray, display: 'block', marginBottom: 6 }}>Message</label>
            <textarea placeholder="Write your message..." value={message} onChange={e => setMessage(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: C.textDark, background: '#F8FAFC', outline: 'none', resize: 'vertical', minHeight: 90, fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <Select label="Target Audience" value={target} onChange={e => setTarget(e.target.value)}
            options={[
              { value: 'all', label: 'Everyone' },
              { value: 'all_teachers', label: 'All Teachers' },
              { value: 'class', label: 'Specific Class' },
              { value: 'student', label: 'Specific Student' },
            ]} />
          {target === 'class' && (
            <Select label="Select Class" value={classId} onChange={e => setClassId(e.target.value)}
              options={[{ value: '', label: 'Choose class...' }, ...classes.map(c => ({ value: c.id, label: c.name }))]} />
          )}
          {sent
            ? <div style={{ padding: '10px 14px', background: `${C.success}10`, border: `1px solid ${C.success}30`, borderRadius: 9, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Check size={14} color={C.success} />
                <span style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>Notification sent!</span>
              </div>
            : <Btn icon={Send} variant="primary" style={{ justifyContent: 'center' }} onClick={handleSend} disabled={sending}>
                {sending ? 'Sending...' : 'Send Notification'}
              </Btn>
          }
        </div>
      </Card>

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textDark, margin: '0 0 14px' }}>Notification History</h3>
        {notifications.length === 0
          ? <Card><p style={{ fontSize: 13, color: C.textGray, margin: 0 }}>No notifications sent yet.</p></Card>
          : notifications.map(n => (
            <Card key={n.id} style={{ padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bell size={15} color={C.primary} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.textDark }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: C.textGray, margin: '3px 0 8px', lineHeight: 1.4 }}>{n.body}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Chip label={n.target_type} />
                    <span style={{ fontSize: 11, color: C.textLight }}>{new Date(n.created_at).toLocaleDateString()}</span>
                    <span style={{ fontSize: 11, color: C.textGray, marginLeft: 'auto' }}>
                      {n.notification_targets?.filter(t => t.is_read).length || 0}/{n.notification_targets?.length || 0} read
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, padding: 4 }}><Trash2 size={13} /></button>
              </div>
            </Card>
          ))
        }
      </div>
    </div>
  )
}
