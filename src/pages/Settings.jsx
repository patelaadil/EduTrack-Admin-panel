import { useState, useEffect } from 'react'
import { RefreshCw, Upload, Lock, AlertTriangle, Calendar, CheckSquare } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../hooks/useData'
import { Card, Avatar, Input, Badge, Btn, Modal } from '../components/UI'

export default function SettingsPage() {
  const { profile } = useAuth()
  const { data: settings, refetch } = useSettings()
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving]           = useState(false)
  const [lateThreshold, setLateThreshold]       = useState(15)
  const [warningPct, setWarningPct]             = useState(75)
  const [appName, setAppName]                   = useState('EduTrack')

  useEffect(() => {
    if (settings) {
      setLateThreshold(settings.late_threshold)
      setWarningPct(settings.attendance_warning_pct)
      setAppName(settings.app_name)
    }
  }, [settings])

  async function saveSettings() {
    setSaving(true)
    await supabase.from('settings').update({
      app_name: appName,
      late_threshold: lateThreshold,
      attendance_warning_pct: warningPct,
      updated_by: profile?.id,
      updated_at: new Date().toISOString(),
    }).eq('id', settings.id)
    refetch()
    setSaving(false)
  }

  async function startNewYear() {
    // Deactivate current year
    await supabase.from('academic_years').update({ is_active: false }).eq('is_active', true)
    // Create new year
    const now = new Date()
    const nextYear = now.getFullYear() + 1
    await supabase.from('academic_years').insert({
      name: `${now.getFullYear()}-${nextYear}`,
      start_date: `${now.getFullYear()}-04-01`,
      end_date: `${nextYear}-03-31`,
      is_active: true
    })
    setShowConfirm(false)
    alert('New academic year started!')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680 }}>
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="⚠️ Start New Academic Year" width={440}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${C.warning}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <AlertTriangle size={24} color={C.warning} />
          </div>
          <p style={{ fontSize: 14, color: C.textDark, lineHeight: 1.6, margin: '0 0 20px' }}>
            This will archive all current year data and begin a new academic year. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowConfirm(false)}>Cancel</Btn>
            <Btn variant="warning" style={{ flex: 1, justifyContent: 'center' }} icon={RefreshCw} onClick={startNewYear}>Yes, Start New Year</Btn>
          </div>
        </div>
      </Modal>

      {/* App Identity */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: C.textDark }}>App Identity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="App Name" value={appName} onChange={e => setAppName(e.target.value)} />
          <Btn variant="primary" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Btn>
        </div>
      </Card>

      {/* Attendance Rules */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: C.textDark }}>Attendance Rules</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.textGray, display: 'block', marginBottom: 6 }}>Late Threshold</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="number" value={lateThreshold} onChange={e => setLateThreshold(Number(e.target.value))}
                style={{ width: 80, padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, fontWeight: 700, color: C.textDark, background: '#F8FAFC', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }} />
              <span style={{ fontSize: 13, color: C.textGray }}>minutes after class start = <Badge label="Late" color={C.warning} /></span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.textGray, display: 'block', marginBottom: 6 }}>Attendance Warning %</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="number" value={warningPct} onChange={e => setWarningPct(Number(e.target.value))}
                style={{ width: 80, padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, fontWeight: 700, color: C.textDark, background: '#F8FAFC', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }} />
              <span style={{ fontSize: 13, color: C.textGray }}>% below = <Badge label="⚠️ Warning" color={C.error} /></span>
            </div>
          </div>
          <Btn variant="primary" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save Rules'}</Btn>
        </div>
      </Card>

      {/* Academic Year */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: C.textDark }}>Academic Year Management</h3>
        <Btn icon={RefreshCw} variant="warning" onClick={() => setShowConfirm(true)}>Start New Academic Year</Btn>
      </Card>

      {/* Admin Profile */}
      <Card>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: C.textDark }}>Admin Profile</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Avatar name={profile?.name || 'Admin'} size={52} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Name" value={profile?.name || ''} />
            <Input label="Email" value={profile?.email || ''} />
          </div>
        </div>
      </Card>
    </div>
  )
}
