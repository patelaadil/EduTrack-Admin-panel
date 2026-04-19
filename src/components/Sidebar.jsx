import {
  LayoutDashboard, Users, GraduationCap, School, CheckSquare,
  BarChart2, Video, Image, Bell, Info, Settings, LogOut, Menu, Calendar,
} from 'lucide-react'
import { C } from '../constants/theme'

const iconMap = {
  LayoutDashboard, Users, GraduationCap, School, CheckSquare,
  BarChart2, Video, Image, Bell, Info, Settings, Calendar,
}

const navItems = [
  { key: 'dashboard',     label: 'Dashboard',        icon: 'LayoutDashboard' },
  { section: 'Academic' },
  { key: 'students',      label: 'Students',          icon: 'GraduationCap' },
  { key: 'teachers',      label: 'Teachers',          icon: 'Users' },
  { key: 'classes',       label: 'Classes',           icon: 'School' },
  { section: 'Attendance' },
  { key: 'attendance',    label: 'Attendance',        icon: 'CheckSquare' },
  { key: 'holidays',      label: 'Holidays',          icon: 'Calendar' },
  { section: 'Content' },
  { key: 'marks',         label: 'Marks',             icon: 'BarChart2' },
  { key: 'videos',        label: 'Videos',            icon: 'Video' },
  { key: 'sliders',       label: 'Slider Management', icon: 'Image' },
  { section: 'Communication' },
  { key: 'notifications', label: 'Notifications',     icon: 'Bell' },
  { section: 'System' },
  { key: 'appinfo',       label: 'App Info',          icon: 'Info' },
  { key: 'settings',      label: 'Settings',          icon: 'Settings' },
]

export default function Sidebar({ active, setActive, collapsed, setCollapsed, onLogout }) {
  return (
    <aside style={{ width: collapsed ? 64 : 240, background: C.sidebar, height: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', transition: 'width 0.25s', zIndex: 100, overflow: 'hidden' }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 16px' : '20px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CheckSquare size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1, letterSpacing: -0.3 }}>EduTrack</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 }}>Admin Panel</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {navItems.map((item, i) => {
          if (item.section) return collapsed ? null : (
            <div key={i} style={{ padding: '12px 20px 4px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>{item.section}</div>
          )
          const Icon = iconMap[item.icon]
          const isActive = active === item.key
          return (
            <button key={item.key} onClick={() => setActive(item.key)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '10px 16px' : '10px 16px 10px 20px', background: isActive ? `${C.primary}22` : 'transparent', color: isActive ? '#fff' : 'rgba(255,255,255,0.55)', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: isActive ? 600 : 400, fontFamily: 'inherit', transition: 'all 0.15s', borderLeft: isActive ? `3px solid ${C.primary}` : '3px solid transparent', marginBottom: 1 }}>
              {Icon && <Icon size={16} style={{ flexShrink: 0 }} />}
              {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Collapse */}
      <button onClick={() => setCollapsed(!collapsed)}
        style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.4)', background: 'transparent', border: 'none', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 12, fontFamily: 'inherit' }}>
        <Menu size={15} />
        {!collapsed && <span>Collapse</span>}
      </button>

      {/* Logout */}
      <button onClick={() => { if(window.confirm('Are you sure you want to logout?')) onLogout() }}
        style={{ padding: collapsed ? '14px 16px' : '14px 20px', display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(239,68,68,0.7)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <LogOut size={15} />
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  )
}
