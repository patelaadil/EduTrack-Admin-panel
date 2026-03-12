import { Video, Trash2 } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useVideos, useClasses } from '../hooks/useData'
import { Card, Chip } from '../components/UI'

export default function VideosPage() {
  const { data: videos, loading, refetch } = useVideos()
  const { data: classes } = useClasses()

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
                <div style={{ marginTop: 10 }}>
                  <button onClick={() => handleDelete(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, padding: 4 }}><Trash2 size={13} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
