import { useState, useRef } from 'react'
import { Plus, Trash2, Image, Info, AlertCircle } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useSliders } from '../hooks/useData'
import { Card, Btn } from '../components/UI'

export default function SlidersPage() {
  const { profile }                          = useAuth()
  const { data: sliders, loading, refetch }  = useSliders()
  const [uploading, setUploading]            = useState(false)
  const [error, setError]                    = useState('')
  const fileRef                              = useRef()

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
    if (!file) return
    if (sliders.length >= 5) { setError('Maximum 5 sliders allowed.'); return }

    setUploading(true)
    setError('')

    // Sanitize filename — remove spaces and special chars
    const ext      = file.name.split('.').pop()
    const safeName = `slider_${Date.now()}.${ext}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sliders')
      .upload(safeName, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      // Bucket may not exist — show clear message
      if (uploadError.message.includes('Bucket not found') || uploadError.statusCode === '400') {
        setError('Storage bucket "sliders" not found. Please create it in Supabase Storage first (see instructions below).')
      } else {
        setError(`Upload failed: ${uploadError.message}`)
      }
      setUploading(false)
      // Reset file input
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    const { data: urlData } = supabase.storage.from('sliders').getPublicUrl(safeName)

    const { error: insertError } = await supabase.from('sliders').insert({
      image_url:   urlData.publicUrl,
      title:       file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      order_index: sliders.length + 1,
      is_active:   true,
      created_by:  profile?.id,
    })

    if (insertError) {
      setError(`Saved image but failed to insert record: ${insertError.message}`)
    } else {
      refetch()
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div>
      {/* Status bar */}
      <div style={{ padding: '10px 16px', background: `${C.primary}08`, border: `1px solid ${C.primary}30`, borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Info size={14} color={C.primary} />
        <span style={{ fontSize: 13, color: C.primary, fontWeight: 500 }}>
          {sliders.length} / 5 Sliders Used · Max 5 allowed
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div style={{ padding: '12px 16px', background: `${C.error}08`, border: `1px solid ${C.error}30`, borderRadius: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertCircle size={16} color={C.error} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 13, color: C.error, fontWeight: 600 }}>{error}</div>
              {error.includes('bucket') && (
                <div style={{ marginTop: 10, fontSize: 12, color: C.textGray, lineHeight: 1.7 }}>
                  <strong>To fix:</strong> Go to{' '}
                  <strong>Supabase Dashboard → Storage → New Bucket</strong><br />
                  • Bucket name: <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>sliders</code><br />
                  • Check <strong>"Public bucket"</strong> ✅<br />
                  • Click <strong>Save</strong><br />
                  Then come back and upload again.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slider list */}
      {loading
        ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>Loading...</div>
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
                <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </Card>
            ))}
          </div>
        )
      }

      {/* Upload button */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        style={{ display: 'none' }}
        disabled={sliders.length >= 5 || uploading}
      />
      <Btn
        icon={Plus}
        variant="outline"
        disabled={sliders.length >= 5 || uploading}
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={() => { setError(''); fileRef.current?.click() }}
      >
        {uploading ? 'Uploading...' : sliders.length >= 5 ? 'Max 5 Sliders Reached' : 'Add Slider (Upload Image)'}
      </Btn>
    </div>
  )
}
