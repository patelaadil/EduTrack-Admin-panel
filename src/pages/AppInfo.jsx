import { useState, useEffect } from 'react'
import { Info, Phone, Globe, Shield, Mail, MapPin, Facebook, Instagram } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useAppInfo } from '../hooks/useData'
import { Card, Input, Btn } from '../components/UI'

export default function AppInfoPage() {
  const { profile } = useAuth()
  const { data: appInfo, refetch } = useAppInfo()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    about_text: '', contact_email: '', contact_phone: '', address: '',
    facebook_url: '', instagram_url: '', website_url: '',
    privacy_policy: '', terms: ''
  })

  useEffect(() => {
    if (appInfo) setForm({ ...appInfo })
  }, [appInfo])

  async function handleSave(fields) {
    setSaving(true)
    await supabase.from('app_info').update({
      ...fields, updated_by: profile?.id, updated_at: new Date().toISOString()
    }).eq('id', appInfo.id)
    refetch()
    setSaving(false)
  }

  const sections = [
    {
      title: 'About Us', icon: Info,
      fields: [{ label: 'About Text', key: 'about_text', type: 'textarea' }]
    },
    {
      title: 'Contact Information', icon: Phone,
      fields: [
        { label: 'Email', key: 'contact_email', icon: Mail },
        { label: 'Phone', key: 'contact_phone', icon: Phone },
        { label: 'Address', key: 'address', icon: MapPin },
      ]
    },
    {
      title: 'Social Media', icon: Globe,
      fields: [
        { label: 'Facebook URL', key: 'facebook_url', icon: Facebook },
        { label: 'Instagram URL', key: 'instagram_url', icon: Instagram },
        { label: 'Website URL', key: 'website_url', icon: Globe },
      ]
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
      {sections.map((section, si) => {
        const Icon = section.icon
        const sectionFields = section.fields.reduce((acc, f) => ({ ...acc, [f.key]: form[f.key] }), {})
        return (
          <Card key={si}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${C.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={C.primary} />
              </div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textDark }}>{section.title}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {section.fields.map((f, fi) =>
                f.type === 'textarea' ? (
                  <div key={fi}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: C.textGray, display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <textarea value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 13, color: C.textDark, background: '#F8FAFC', outline: 'none', resize: 'vertical', minHeight: 80, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                ) : (
                  <Input key={fi} label={f.label} icon={f.icon} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.label} />
                )
              )}
            </div>
            <Btn variant="primary" style={{ marginTop: 14 }} onClick={() => handleSave(sectionFields)} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Btn>
          </Card>
        )
      })}

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `${C.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={15} color={C.primary} />
          </div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textDark }}>Legal</h3>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="outline">Edit Privacy Policy</Btn>
          <Btn variant="outline">Edit Terms & Conditions</Btn>
        </div>
      </Card>
    </div>
  )
}
