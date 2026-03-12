import { useState, useEffect } from 'react'
import { C } from './constants/theme'
import { AuthProvider, useAuth } from './context/AuthContext'

// Layout
import Sidebar from './components/Sidebar'
import TopBar  from './components/TopBar'

// Pages
import LoginPage       from './pages/Login'
import Dashboard       from './pages/Dashboard'
import StudentsPage    from './pages/Students'
import TeachersPage    from './pages/Teachers'
import ClassesPage     from './pages/Classes'
import AttendancePage  from './pages/Attendance'
import MarksPage       from './pages/Marks'
import VideosPage      from './pages/Videos'
import SlidersPage     from './pages/Sliders'
import NotificationsPage from './pages/Notifications'
import AppInfoPage     from './pages/AppInfo'
import SettingsPage    from './pages/Settings'

const pages = {
  dashboard:     { title: 'Dashboard',         component: Dashboard },
  students:      { title: 'Students',          component: StudentsPage },
  teachers:      { title: 'Teachers',          component: TeachersPage },
  classes:       { title: 'Classes / Batches', component: ClassesPage },
  attendance:    { title: 'Attendance',        component: AttendancePage },
  marks:         { title: 'Marks & Reports',   component: MarksPage },
  videos:        { title: 'Videos',            component: VideosPage },
  sliders:       { title: 'Slider Management', component: SlidersPage },
  notifications: { title: 'Notifications',     component: NotificationsPage },
  appinfo:       { title: 'App Info',          component: AppInfoPage },
  settings:      { title: 'Settings',          component: SettingsPage },
}

function AdminApp() {
  const { user, profile, loading, signOut } = useAuth()
  const [activePage, setActivePage] = useState('dashboard')
  const [collapsed, setCollapsed]   = useState(false)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'
    document.head.appendChild(link)
    document.body.style.margin = '0'
    document.body.style.fontFamily = "'DM Sans', sans-serif"
    document.body.style.background = C.bg
    document.body.style.webkitFontSmoothing = 'antialiased'
  }, [])

  // Show loading spinner while checking session
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: C.textGray, fontSize: 13 }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in → show login page
  if (!user) return <LoginPage onLogin={() => {}} />

  const { title, component: PageComponent } = pages[activePage]
  const sidebarWidth = collapsed ? 64 : 240

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', background: C.bg }}>
      <Sidebar
        active={activePage}
        setActive={setActivePage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={signOut}
        profile={profile}
      />
      <TopBar page={title} collapsed={collapsed} profile={profile} />
      <main style={{ marginLeft: sidebarWidth, paddingTop: 60, minHeight: '100vh', transition: 'margin-left 0.25s' }}>
        <div style={{ padding: 28 }}>
          <PageComponent />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  )
}
