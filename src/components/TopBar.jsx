import { Bell, ChevronRight, Search } from 'lucide-react'
import { C } from '../constants/theme'
import { Avatar } from './UI'
import { useNotifications } from '../hooks/useData'

export default function TopBar({ page, collapsed, profile, onNavigate }) {
  const { data: notifications } = useNotifications()
  const unread = notifications.filter(n =>
    (n.notification_targets?.filter(t => !t.is_read).length || 0) > 0 ||
    n.notification_targets?.length === 0
  ).length

  const left = collapsed ? 64 : 240
  const displayName  = profile?.name  || 'Admin'
  const displayEmail = profile?.email || 'admin@school.edu'

  return (
    <header style={{
      position: 'fixed', top: 0, left, right: 0, height: 60,
      background: C.card, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', zIndex: 99, transition: 'left 0.25s'
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: C.textLight, fontSize: 13 }}>EduTrack</span>
        <ChevronRight size={13} color={C.textLight} />
        <span style={{ color: C.textDark, fontWeight: 600, fontSize: 14 }}>{page}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Quick Search */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.textLight }} />
          <input
            placeholder="Quick search..."
            style={{
              padding: '7px 12px 7px 32px', border: `1.5px solid ${C.border}`,
              borderRadius: 9, fontSize: 13, color: C.textDark,
              background: '#F8FAFC', outline: 'none', width: 200, fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Bell icon → navigates to notifications */}
        <div
          onClick={() => onNavigate('notifications')}
          style={{ position: 'relative', cursor: 'pointer', padding: 4 }}
          title="Notifications"
        >
          <Bell size={18} color={C.textGray} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2,
              width: 16, height: 16, background: C.error,
              borderRadius: '50%', fontSize: 9, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>

        {/* Admin profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar name={displayName} size={32} color={C.primary} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{displayName}</div>
            <div style={{ fontSize: 11, color: C.textLight }}>{displayEmail}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
