import { useEffect, useState } from 'react'
import { Plus, Trash2, Calendar, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { C } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { Card, Btn, Modal, Input, Badge } from '../components/UI'
import { useSupabase } from '../hooks/useData'

function toLocalDateString(date = new Date()) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().split('T')[0]
}

function toTomorrowString() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return toLocalDateString(tomorrow)
}

function getAcademicBounds(referenceDate = new Date()) {
  const year = referenceDate.getMonth() >= 3 ? referenceDate.getFullYear() : referenceDate.getFullYear() - 1
  return {
    start: `${year}-04-01`,
    end: `${year + 1}-03-31`,
    name: `${year}-${year + 1}`,
  }
}

function buildMonthList(startStr, endStr) {
  const start = new Date(`${startStr}T00:00:00`)
  const end = new Date(`${endStr}T00:00:00`)
  const months = []
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1)

  while (cursor <= end) {
    months.push({
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
      key: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`,
    })
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }

  return months
}

function maxIsoDate(a, b) {
  if (!a) return b
  if (!b) return a
  return a > b ? a : b
}

function isDateInRange(dateStr, startStr, endStr) {
  return dateStr >= startStr && dateStr <= endStr
}

function formatRange(h) {
  if (h.end_date && h.end_date !== h.date) return `${h.date} → ${h.end_date}`
  return h.date
}

function getHolidayErrorMessage(message) {
  if (!message) return 'Something went wrong while saving the holiday.'
  const lower = message.toLowerCase()
  if (lower.includes('schema cache') || lower.includes('public.holidays') || lower.includes('relation "holidays" does not exist')) {
    return 'The holidays table is missing in Supabase. Run the provided SQL migration to create it.'
  }
  return message
}

export default function HolidaysPage() {
  const { data: holidays, loading: holidaysLoading, error: fetchError, refetch } = useSupabase('holidays', { order: 'date', asc: true })
  const { data: academicYears, loading: yearsLoading } = useSupabase('academic_years', { filter: { col: 'is_active', val: true } })

  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [holidayType, setHolidayType] = useState('single')
  const [form, setForm] = useState({ date: '', endDate: '', reason: '' })
  const [monthIndex, setMonthIndex] = useState(0)

  const activeYear = academicYears?.[0] || null
  const fallbackBounds = getAcademicBounds()
  const academicStart = activeYear?.start_date || fallbackBounds.start
  const academicEnd = activeYear?.end_date || fallbackBounds.end
  const academicName = activeYear?.name || fallbackBounds.name
  const holidayRanges = holidays.map(h => ({
    start: h.date,
    end: h.end_date || h.date,
    reason: h.reason,
  }))
  const latestHolidayEnd = holidayRanges.reduce((latest, h) => maxIsoDate(latest, h.end), '')
  const displayEnd = maxIsoDate(academicEnd, latestHolidayEnd)
  const monthCards = buildMonthList(academicStart, displayEnd)
  const monthStateKey = `${monthCards.length}:${latestHolidayEnd || ''}`
  const todayStr = toLocalDateString()
  const futureMin = toTomorrowString()
  const selectedMonth = monthCards[monthIndex] || monthCards[0]
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  useEffect(() => {
    if (!monthCards.length) return
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    const todayIdx = monthCards.findIndex(m => m.key === todayKey)
    const latestHolidayKey = latestHolidayEnd
      ? `${latestHolidayEnd.slice(0, 4)}-${latestHolidayEnd.slice(5, 7)}`
      : ''
    const latestHolidayIdx = latestHolidayKey
      ? monthCards.findIndex(m => m.key === latestHolidayKey)
      : -1
    setMonthIndex(prev => {
      if (prev > 0 && prev < monthCards.length) return prev
      if (todayIdx >= 0) return todayIdx
      if (latestHolidayIdx >= 0) return latestHolidayIdx
      return 0
    })
  }, [monthStateKey])

  async function handleAdd() {
    if (!form.date || !form.reason) return

    if (holidayType === 'range' && (!form.endDate || form.endDate < form.date)) {
      setError('Please choose an end date on or after the start date.')
      return
    }
    if (form.date < futureMin) {
      setError(`Start date must be a future date on or after ${futureMin}.`)
      return
    }
    if (holidayType === 'range' && form.endDate && form.endDate < futureMin) {
      setError(`End date must be a future date on or after ${futureMin}.`)
      return
    }

    setSaving(true)
    setError('')

    const { error: err } = await supabase.from('holidays').upsert({
      date: form.date,
      end_date: holidayType === 'range' ? form.endDate : null,
      reason: form.reason,
    }, { onConflict: 'date' })

    if (err) {
      setError(getHolidayErrorMessage(err.message))
      setSaving(false)
      return
    }

    setError('')
    refetch()
    setShowAdd(false)
    setHolidayType('single')
    setForm({ date: '', endDate: '', reason: '' })
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this holiday?')) return
    const { error: err } = await supabase.from('holidays').delete().eq('id', id)
    if (err) {
      setError(getHolidayErrorMessage(err.message))
      return
    }
    setError('')
    refetch()
  }

  function renderMonthCard({ year, month, key }) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const monthLabel = `${monthNames[month]} ${year}`
    const selected = selectedMonth?.key === key

    return (
      <Card key={key} style={{ padding: 18, border: selected ? `1.5px solid ${C.primary}` : `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textDark }}>{monthLabel}</h3>
            <div style={{ fontSize: 11, color: C.textGray, marginTop: 4 }}>
              {selected ? 'Selected month' : 'Preview'}
            </div>
          </div>
          <Badge label={monthLabel} color={selected ? C.primary : C.textGray} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ fontSize: 10, fontWeight: 700, color: C.textGray, padding: '4px 0', textTransform: 'uppercase' }}>{d}</div>
          ))}
          {Array(firstDay).fill(null).map((_, i) => (
            <div key={`e-${key}-${i}`} style={{ padding: 8 }} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isSun = new Date(year, month, day).getDay() === 0
            const holidayMatch = holidayRanges.find(h => isDateInRange(dateStr, h.start, h.end))
            const isHoliday = !!holidayMatch
            const isToday = dateStr === todayStr

            let bg = 'transparent'
            let color = C.textDark
            if (isSun) { bg = `${C.textGray}15`; color = C.textGray }
            if (isHoliday) { bg = `${C.error}12`; color = C.error }
            if (isToday) { bg = C.primary; color = '#fff' }

            return (
              <div
                key={day}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: isToday ? 700 : 500,
                    background: bg,
                    color,
                    position: 'relative',
                    border: isHoliday && !isToday ? `1.5px solid ${C.error}40` : '1.5px solid transparent',
                  }}
                >
                {day}
                {(isSun || isHoliday) && !isToday && (
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      background: isSun ? C.textGray : C.error,
                      position: 'absolute',
                      bottom: 3,
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </Card>
    )
  }

  const selectedMonthHolidays = holidays.filter(h => {
    if (!selectedMonth) return false
    const start = h.date
    const end = h.end_date || h.date
    const monthStart = `${selectedMonth.year}-${String(selectedMonth.month + 1).padStart(2, '0')}-01`
    const monthEnd = `${selectedMonth.year}-${String(selectedMonth.month + 1).padStart(2, '0')}-${new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate()}`
    return !(end < monthStart || start > monthEnd)
  })

  return (
    <div>
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setError('') }} title="Add Holiday">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8, padding: 4, background: `${C.primary}08`, borderRadius: 12 }}>
            <button
              type="button"
              onClick={() => setHolidayType('single')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 10,
                border: 'none',
                background: holidayType === 'single' ? C.primary : 'transparent',
                color: holidayType === 'single' ? '#fff' : C.textGray,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Single Date
            </button>
            <button
              type="button"
              onClick={() => setHolidayType('range')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 10,
                border: 'none',
                background: holidayType === 'range' ? C.primary : 'transparent',
                color: holidayType === 'range' ? '#fff' : C.textGray,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Vacation Range
            </button>
          </div>

          <Input
            label={holidayType === 'single' ? 'Date' : 'Start Date'}
            type="date"
            min={futureMin}
            value={form.date}
            onChange={e => {
              const nextDate = e.target.value
              setForm(prev => ({
                ...prev,
                date: nextDate,
                endDate: prev.endDate && prev.endDate < nextDate ? nextDate : prev.endDate,
              }))
            }}
          />

          {holidayType === 'range' && (
            <Input
              label="End Date"
              type="date"
              min={form.date || futureMin}
              value={form.endDate}
              onChange={e => setForm({ ...form, endDate: e.target.value })}
            />
          )}

          <Input
            label="Reason"
            placeholder="e.g. Republic Day"
            value={form.reason}
            onChange={e => setForm({ ...form, reason: e.target.value })}
          />

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: `${C.error}10`, border: `1px solid ${C.error}30`, borderRadius: 9 }}>
              <AlertCircle size={14} color={C.error} />
              <span style={{ fontSize: 13, color: C.error }}>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Btn variant="primary" style={{ flex: 1 }} icon={Check} onClick={handleAdd} disabled={saving}>
              {saving ? 'Saving...' : 'Add Holiday'}
            </Btn>
            <Btn variant="outline" onClick={() => { setShowAdd(false); setError('') }}>Cancel</Btn>
          </div>
        </div>
      </Modal>

      <Card style={{ marginBottom: 16, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Calendar size={18} color={C.primary} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textDark }}>Holiday Management</h2>
          <Badge label={`${holidays.length} holidays`} color={C.primary} />
          <Badge label={academicName} color={C.textGray} />
          <div style={{ flex: 1 }} />
          <Btn icon={Plus} variant="primary" onClick={() => setShowAdd(true)}>Add Holiday</Btn>
        </div>
      </Card>

      <div style={{ padding: '10px 16px', background: `${C.primary}08`, border: `1px solid ${C.primary}30`, borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Calendar size={14} color={C.primary} />
        <span style={{ fontSize: 13, color: C.primary, fontWeight: 500 }}>
          Future dates only. New holidays are saved directly to Supabase and will appear across the app/web.
        </span>
      </div>

      {fetchError && (
        <div style={{ padding: '12px 16px', background: `${C.warning}12`, border: `1px solid ${C.warning}30`, borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={14} color={C.warning} />
          <span style={{ fontSize: 13, color: C.textDark, lineHeight: 1.5 }}>
            Holiday data could not be loaded. {getHolidayErrorMessage(fetchError)}
          </span>
        </div>
      )}

      <Card style={{ marginBottom: 16, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textDark }}>
              {selectedMonth ? `${monthNames[selectedMonth.month]} ${selectedMonth.year}` : 'Month View'}
            </h3>
            <div style={{ fontSize: 11, color: C.textGray, marginTop: 4 }}>
              Pick a month inside the visible holiday range
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Btn
              variant="outline"
              icon={ChevronLeft}
              onClick={() => setMonthIndex(i => Math.max(0, i - 1))}
              disabled={monthIndex <= 0}
            >
              Back
            </Btn>
            <select
              value={selectedMonth?.key || ''}
              onChange={e => setMonthIndex(monthCards.findIndex(m => m.key === e.target.value))}
              style={{
                padding: '9px 12px',
                border: `1.5px solid ${C.border}`,
                borderRadius: 9,
                fontSize: 13,
                color: C.textDark,
                background: '#F8FAFC',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            >
              {monthCards.map((m) => (
                <option key={m.key} value={m.key}>{monthNames[m.month]} {m.year}</option>
              ))}
            </select>
            <Btn
              variant="outline"
              icon={ChevronRight}
              onClick={() => setMonthIndex(i => Math.min(monthCards.length - 1, i + 1))}
              disabled={monthIndex >= monthCards.length - 1}
            >
              Forward
            </Btn>
          </div>
        </div>

        {(holidaysLoading || yearsLoading)
          ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>Loading academic year...</div>
          : selectedMonth && renderMonthCard(selectedMonth)}
      </Card>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.textDark }}>
            Holidays in {selectedMonth ? `${monthNames[selectedMonth.month]} ${selectedMonth.year}` : 'this month'}
          </h3>
        </div>
        {holidaysLoading
          ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>Loading...</div>
          : selectedMonthHolidays.length === 0
            ? <div style={{ padding: 40, textAlign: 'center', color: C.textGray }}>No holidays in this month.</div>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {['Date', 'Day', 'Reason', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textGray, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedMonthHolidays.map((h, i) => {
                    const dayName = new Date(h.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
                    return (
                      <tr key={h.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? '#fff' : '#FAFBFD' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: C.textDark }}>{formatRange(h)}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: C.textGray }}>{dayName}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: C.textGray }}>{h.reason}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <button onClick={() => handleDelete(h.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.error, padding: 4 }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
      </Card>
    </div>
  )
}
