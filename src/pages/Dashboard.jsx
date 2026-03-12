import { GraduationCap, Users, CheckSquare, School, ArrowUpRight, ArrowDownRight, Plus, Download, Bell } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { C } from '../constants/theme'
import { useDashboardStats, useRecentRegistrations, useNotifications } from '../hooks/useData'
import { Card, Avatar, Btn } from '../components/UI'

// Static chart data (attendance trend from real DB would need more queries)
const attendanceTrend = [
  { day: 'Mon', pct: 88 }, { day: 'Tue', pct: 91 }, { day: 'Wed', pct: 78 },
  { day: 'Thu', pct: 85 }, { day: 'Fri', pct: 93 }, { day: 'Sat', pct: 72 }, { day: 'Today', pct: 82 },
]
const classAttendance = [
  { cls: '10-A', pct: 91 }, { cls: '10-B', pct: 78 }, { cls: '9-A', pct: 85 },
  { cls: '9-B', pct: 88 }, { cls: '8-A', pct: 72 }, { cls: '8-B', pct: 95 },
]

export default function Dashboard() {
  const { stats, loading: statsLoading }     = useDashboardStats()
  const { data: recentRegs }                 = useRecentRegistrations()
  const { data: notifications }              = useNotifications()

  const kpis = [
    { label: 'Total Students',      value: statsLoading ? '...' : stats.students, icon: GraduationCap, color: C.primary,  bg: `${C.primary}12`,  delta: 'registered', up: true },
    { label: 'Total Teachers',      value: statsLoading ? '...' : stats.teachers, icon: Users,         color: C.purple,   bg: `${C.purple}12`,   delta: 'active',     up: true },
    { label: "Today's Attendance",  value: statsLoading ? '...' : `${stats.todayPct}%`, icon: CheckSquare, color: C.success, bg: `${C.success}12`, delta: 'today',  up: stats.todayPct >= 75 },
    { label: 'Total Classes',       value: statsLoading ? '...' : stats.classes,  icon: School,        color: C.orange,   bg: `${C.orange}12`,   delta: 'active',     up: true },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {kpis.map((k, i) => {
          const Icon = k.icon
          return (
            <Card key={i} style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12, color: C.textGray, margin: 0, marginBottom: 6, fontWeight: 500 }}>{k.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: C.textDark, margin: 0, letterSpacing: -1 }}>{k.value}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    {k.up ? <ArrowUpRight size={12} color={C.success} /> : <ArrowDownRight size={12} color={C.error} />}
                    <span style={{ fontSize: 11, color: k.up ? C.success : C.error }}>{k.delta}</span>
                  </div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={k.color} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn icon={Plus} variant="primary">Add Student</Btn>
        <Btn icon={Plus} variant="outline">Add Teacher</Btn>
        <Btn icon={Plus} variant="outline">Add Class</Btn>
        <Btn icon={Download} variant="ghost">Export Report</Btn>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textDark, margin: '0 0 16px' }}>Attendance Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: C.textGray }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: C.textGray }} unit="%" />
              <Tooltip formatter={v => `${v}%`} contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }} />
              <Line type="monotone" dataKey="pct" stroke={C.primary} strokeWidth={2.5} dot={{ fill: C.primary, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textDark, margin: '0 0 16px' }}>Class-wise Attendance Today</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={classAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="cls" tick={{ fontSize: 11, fill: C.textGray }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: C.textGray }} unit="%" />
              <Tooltip formatter={v => `${v}%`} contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }} />
              <Bar dataKey="pct" radius={[5, 5, 0, 0]}>
                {classAttendance.map((e, i) => <Cell key={i} fill={e.pct >= 85 ? C.success : e.pct >= 75 ? C.warning : C.error} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textDark, margin: '0 0 16px' }}>Recent Registrations</h3>
          {recentRegs.length === 0
            ? <p style={{ fontSize: 13, color: C.textGray }}>No students registered yet.</p>
            : recentRegs.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar name={r.profiles?.name || '?'} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{r.profiles?.name}</div>
                  <div style={{ fontSize: 11, color: C.textGray }}>{r.classes?.name}</div>
                </div>
                <span style={{ fontSize: 11, color: C.textLight }}>{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))
          }
        </Card>
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textDark, margin: '0 0 16px' }}>Latest Notifications</h3>
          {notifications.length === 0
            ? <p style={{ fontSize: 13, color: C.textGray }}>No notifications sent yet.</p>
            : notifications.slice(0, 4).map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: 10, borderBottom: i < 3 ? `1px solid ${C.border}` : 'none', marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${C.primary}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bell size={14} color={C.primary} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: C.textGray, marginTop: 2 }}>{n.target_type} · {new Date(n.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          }
        </Card>
      </div>
    </div>
  )
}
