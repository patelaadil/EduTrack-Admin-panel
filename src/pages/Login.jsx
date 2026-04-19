import { useState } from 'react'
import { CheckSquare, Mail, Lock, AlertCircle } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { Input } from '../components/UI'
import { useAuth } from '../context/AuthContext'

export default function LoginPage({ onLogin }) {
  const { signIn } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    if (!email || !password) { setError('Please enter email and password.'); return }
    setLoading(true); setError('')
    const { data, error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const user = data.user
    if (!user) {
      setError('Login failed. Please try again.')
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (profileError) {
      setError(profileError.message)
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (profile?.is_active === false) {
      setError('Account inactive. Contact your school admin.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (profile?.role !== 'admin') {
      setError('This panel is for admin users only.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    onLogin()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckSquare size={30} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '0 0 6px', letterSpacing: -0.5 }}>EduTrack</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>Admin Panel · Smart Attendance System</p>
        </div>
        <div style={{ background: C.card, borderRadius: 20, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: C.textDark }}>Welcome back 👋</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Email Address" icon={Mail} type="email" placeholder="admin@school.edu" value={email} onChange={e => setEmail(e.target.value)} />
            <Input label="Password" icon={Lock} type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} />
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: `${C.error}10`, border: `1px solid ${C.error}30`, borderRadius: 9 }}>
                <AlertCircle size={14} color={C.error} />
                <span style={{ fontSize: 13, color: C.error }}>{error}</span>
              </div>
            )}
            <button onClick={handleLogin} disabled={loading}
              style={{ padding: '12px', background: loading ? C.textLight : C.primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: C.textLight, margin: '20px 0 0' }}>EduTrack v1.0 · Single School Edition</p>
        </div>
      </div>
    </div>
  )
}
