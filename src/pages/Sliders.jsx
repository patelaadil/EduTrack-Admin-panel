import { useState } from 'react'
import { Plus, Trash2, Image, Info } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useSliders } from '../hooks/useData'
import { Card, Btn } from '../components/UI'

export default function SlidersPage() {
  const { profile } = useAuth()
  const { data: sliders, loading, refetch } = useSliders()
  const [uploading, setUploading] = useState(false)

  async function handleToggle(id, current) {
    await supabase.from('sliders').update({ is_active: !current }).eq('id', id)
    refetch()
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this slider?')) return
    await supabase.from('sliders').delete().eq('id', id)
    refetch()
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file || sliders.length >= 5) return
    setUploading(true)
    const fileName = `${Date.now()}_${file.name}`
    const { data: uploadData } = await supabase.storage.from('sliders').upload(fileName, file)
    if (uploadData) {
      const { data: urlData } = supabase.storage.from('sliders').getPublicUrl(fileName)
      await supabase.from('sliders').insert({
        image_url: urlData.publicUrl,
        title: file.name.replace(/\.[^/.]+$/, ''),
        order_index: sliders.length + 1,
        is_active: true,
        created_by: profile?.id
      })
      refetch()
    }
    setUploading(false)
  }

  return (
    <div>
      <div style={{ padding: '10px 16px', background: `${C.primary}08`, border: `1px solid ${C.primary}30`, borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Info size={14} color={C.primary} />
        <span style={{ fontSize: 13, color: C.primary, fontWeight: 500 }}>{sliders.length} / 5 Sliders Used · Max 5 allowed</span>
      </div>

      {loading
        ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>Loading sliders...</div>
        : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {sliders.map((s, i) => (
            <Card key={s.id} style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 80, height: 48, borderRadius: 8, background: `linear-gradient(135deg, ${C.primary}30, ${C.primary}60)`, flexShrink: 0, overflow: 'hidden' }}>
                {s.image_url
                  ? <img src={s.image_url} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Image size={20} color={C.primary} /></div>
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.textDark }}>{s.title || `Slider ${i + 1}`}</div>
                <div style={{ fontSize: 11, color: C.textGray, marginTop: 3 }}>Position {s.order_index}</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.textGray, cursor: 'pointer' }}>
                <input type="checkbox" checked={s.is_active} onChange={() => handleToggle(s.id, s.is_active)} style={{ accentColor: C.primary }} />
                Active
              </label>
              <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, padding: 4 }}><Trash2 size={14} /></button>
            </Card>
          ))}
        </div>
      )}

      <label style={{ display: 'block' }}>
        <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={sliders.length >= 5 || uploading} />
        <Btn icon={Plus} variant="outline" disabled={sliders.length >= 5 || uploading} style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => document.querySelector('input[type=file]').click()}>
          {uploading ? 'Uploading...' : sliders.length >= 5 ? 'Max 5 Sliders Reached' : 'Add Slider (Upload Image)'}
        </Btn>
      </label>
    </div>
  )
}
