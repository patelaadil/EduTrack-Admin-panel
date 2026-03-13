import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ─── Generic fetch hook ───────────────────────────────────────
export function useSupabase(table, options = {}) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  async function fetch() {
    setLoading(true)
    let query = supabase.from(table).select(options.select || '*')
    if (options.filter)  query = query.eq(options.filter.col, options.filter.val)
    if (options.order)   query = query.order(options.order, { ascending: options.asc ?? false })
    if (options.limit)   query = query.limit(options.limit)
    const { data: rows, error: err } = await query
    if (err) setError(err.message)
    else setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [table])
  return { data, loading, error, refetch: fetch }
}

// ─── STUDENTS ────────────────────────────────────────────────
// NOTE: students table has TWO fkeys to profiles (profile_id + registered_by)
// Must use !fkey syntax to disambiguate, otherwise Supabase returns null silently
export function useStudents() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('students')
      .select(`
        uuid, roll_number, dob, qr_code_url,
        profiles:profile_id ( id, name, photo_url, phone, email, is_active ),
        classes  ( id, name, department ),
        academic_years ( name )
      `)
      .order('created_at', { ascending: false })
    if (error) console.error('useStudents error:', error.message)
    setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, loading, refetch: fetch }
}

// ─── TEACHERS ────────────────────────────────────────────────
export function useTeachers() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('teachers')
      .select(`
        id, can_add_videos, can_add_marks, can_add_reports,
        profiles ( id, name, photo_url, phone, email, is_active ),
        teacher_classes ( subject, classes ( id, name ) )
      `)
      .order('created_at', { ascending: false })
    if (error) console.error('useTeachers error:', error.message)
    setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, loading, refetch: fetch }
}

// ─── CLASSES ─────────────────────────────────────────────────
export function useClasses() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('classes')
      .select(`
        id, name, department, year,
        academic_years ( name ),
        teacher_classes ( teachers ( profiles ( name ) ) )
      `)
      .order('name')
    if (error) console.error('useClasses error:', error.message)
    setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, loading, refetch: fetch }
}

// ─── ATTENDANCE SESSIONS ─────────────────────────────────────
export function useAttendance() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('attendance_sessions')
      .select(`
        id, session_date, subject, start_time,
        classes   ( id, name ),
        teachers  ( profiles ( name ) ),
        attendance_records ( status )
      `)
      .order('session_date', { ascending: false })
      .limit(50)
    if (error) console.error('useAttendance error:', error.message)
    setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, loading, refetch: fetch }
}

// ─── MARKS ───────────────────────────────────────────────────
export function useMarks() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('marks')
      .select(`
        id, subject, exam_type, marks_obtained, total_marks, percentage, grade,
        students ( uuid, roll_number, profiles:profile_id ( name ) ),
        classes  ( name ),
        teachers ( profiles ( name ) )
      `)
      .order('created_at', { ascending: false })
    if (error) console.error('useMarks error:', error.message)
    setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, loading, refetch: fetch }
}

// ─── REPORTS ─────────────────────────────────────────────────
export function useReports() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('reports')
      .select(`
        id, title, file_url, created_at,
        students ( profiles:profile_id ( name ) ),
        classes  ( name ),
        teachers ( profiles ( name ) )
      `)
      .order('created_at', { ascending: false })
    if (error) console.error('useReports error:', error.message)
    setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, loading, refetch: fetch }
}

// ─── VIDEOS ──────────────────────────────────────────────────
export function useVideos() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('videos')
      .select(`
        id, title, description, video_url, thumbnail_url, subject, created_at,
        classes  ( id, name ),
        teachers ( profiles ( name ) )
      `)
      .order('created_at', { ascending: false })
    if (error) console.error('useVideos error:', error.message)
    setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, loading, refetch: fetch }
}

// ─── NOTIFICATIONS ───────────────────────────────────────────
export function useNotifications() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('notifications')
      .select(`
        id, title, body, target_type, created_at,
        profiles ( name ),
        notification_targets ( is_read )
      `)
      .order('created_at', { ascending: false })
    if (error) console.error('useNotifications error:', error.message)
    setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, loading, refetch: fetch }
}

// ─── SLIDERS ─────────────────────────────────────────────────
export function useSliders() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('sliders')
      .select('*')
      .order('order_index')
    if (error) console.error('useSliders error:', error.message)
    setData(rows || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, loading, refetch: fetch }
}

// ─── SETTINGS ────────────────────────────────────────────────
export function useSettings() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    const { data: row, error } = await supabase
      .from('settings')
      .select('*')
      .single()
    if (error) console.error('useSettings error:', error.message)
    setData(row)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, loading, refetch: fetch }
}

// ─── APP INFO ────────────────────────────────────────────────
export function useAppInfo() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetch() {
    setLoading(true)
    const { data: row, error } = await supabase
      .from('app_info')
      .select('*')
      .single()
    if (error) console.error('useAppInfo error:', error.message)
    setData(row)
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])
  return { data, loading, refetch: fetch }
}

// ─── DASHBOARD STATS ─────────────────────────────────────────
export function useDashboardStats() {
  const [stats, setStats]     = useState({ students: 0, teachers: 0, classes: 0, todayPct: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const today = new Date().toISOString().split('T')[0]
      const [
        { count: students },
        { count: teachers },
        { count: classes },
        { data: todaySessions },
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('classes').select('*',  { count: 'exact', head: true }),
        supabase.from('attendance_sessions')
          .select('attendance_records ( status )')
          .eq('session_date', today),
      ])

      let present = 0, total = 0
      todaySessions?.forEach(s => {
        s.attendance_records?.forEach(r => {
          total++
          if (r.status === 'present' || r.status === 'late') present++
        })
      })

      setStats({
        students: students || 0,
        teachers: teachers || 0,
        classes:  classes  || 0,
        todayPct: total > 0 ? Math.round((present / total) * 100) : 0,
      })
      setLoading(false)
    }
    fetch()
  }, [])

  return { stats, loading }
}

// ─── RECENT REGISTRATIONS ────────────────────────────────────
export function useRecentRegistrations() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data: rows, error } = await supabase
        .from('students')
        .select(`
          uuid, roll_number, created_at,
          profiles:profile_id ( name ),
          classes  ( name )
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) console.error('useRecentRegistrations error:', error.message)
      setData(rows || [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { data, loading }
}
