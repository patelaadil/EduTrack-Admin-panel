import { useState } from 'react'
import { Video, Trash2, Edit2, Check, AlertCircle } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useVideos, useClasses } from '../hooks/useData'
import { Card, Chip, Modal, Input, Select, Btn } from '../components/UI'

export default function VideosPage() {
  const { data: videos, loading, refetch } = useVideos()
  const { data: classes } = useClasses()
  const [editVideo, setEditVideo] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleUpdateVideo() {
    if (!editVideo.title || !editVideo.video_url) return
    setSaving(true)
    setError('')

    const { error: vErr } = await supabase.from('videos').update({
      title: editVideo.title,
      description: editVideo.description || null,
      video_url: editVideo.video_url,
      thumbnail_url: editVideo.thumbnail_url || null,
      subject: editVideo.subject || null,
      class_id: editVideo.class_id || null,
    }).eq('id', editVideo.id)

    if (vErr) {
      setError(vErr.message)
      setSaving(false)
      return
    }

    refetch()
    setEditVideo(null)
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this video?')) return
    await supabase.from('videos').delete().eq('id', id)
    refetch()
  }

  return (
    <div>
      <Card style={{ marginBottom: 16, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textDark }}>Videos</h2>
          <div style={{ flex: 1 }} />
          <select style={{ padding: '7px 10px', border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: C.textDark, background: '#F8FAFC', outline: 'none', fontFamily: 'inherit' }}>
            <option>All Classes</option>
            {classes.map(c => <option key={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Card>

      {loading
        ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>Loading videos...</div>
        : videos.length === 0
          ? <Card><p style={{ fontSize: 13, color: C.textGray, margin: 0 }}>No videos uploaded yet. Teachers can upload videos from their app.</p></Card>
          : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {videos.map(v => (
            <Card key={v.id} style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 140, background: `linear-gradient(135deg, ${C.primary}20, ${C.primary}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {v.thumbnail_url
                  ? <img src={v.thumbnail_url} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Video size={20} color={C.primary} />
                    </div>
                }
              </div>
              <div style={{ padding: '14px 16px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: C.textDark, lineHeight: 1.3 }}>{v.title}</h4>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {v.subject && <Chip label={v.subject} />}
                  {v.classes?.name && <Chip label={v.classes.name} color={C.orange} />}
                </div>
                <div style={{ fontSize: 11, color: C.textGray }}>{v.teachers?.profiles?.name} · {new Date(v.created_at).toLocaleDateString()}</div>
                <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                  <button onClick={() => setEditVideo(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.warning || '#f59e0b', padding: 4 }}><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, padding: 4 }}><Trash2 size={13} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={!!editVideo} onClose={() => { setEditVideo(null); setError('') }} title="Edit Video">
        {editVideo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Title" placeholder="Video Title" value={editVideo.title || ''}
              onChange={e => setEditVideo({...editVideo, title: e.target.value})} />
            <Input label="Video URL" placeholder="https://..." value={editVideo.video_url || ''}
              onChange={e => setEditVideo({...editVideo, video_url: e.target.value})} />
            <Input label="Thumbnail URL (optional)" placeholder="https://..." value={editVideo.thumbnail_url || ''}
              onChange={e => setEditVideo({...editVideo, thumbnail_url: e.target.value})} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Subject" placeholder="Physics" value={editVideo.subject || ''}
                onChange={e => setEditVideo({...editVideo, subject: e.target.value})} />
              <Select label="Class" value={editVideo.class_id || ''}
                onChange={e => setEditVideo({...editVideo, class_id: e.target.value})}
                options={[{ value: '', label: 'Select class...' }, ...classes.map(c => ({ value: c.id, label: c.name }))]} />
            </div>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: `${C.error}10`, border: `1px solid ${C.error}30`, borderRadius: 9 }}>
                <AlertCircle size={14} color={C.error} />
                <span style={{ fontSize: 13, color: C.error }}>{error}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <Btn variant="primary" style={{ flex: 1 }} icon={Check} onClick={handleUpdateVideo} disabled={saving}>
                {saving ? 'Saving...' : 'Update Video'}
              </Btn>
              <Btn variant="outline" onClick={() => { setEditVideo(null); setError('') }}>Cancel</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
