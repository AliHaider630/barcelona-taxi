'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'bookings' | 'drivers'>('overview')

  const user = session?.user as any

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && user?.role !== 'ADMIN') router.push('/')
    if (status === 'authenticated' && user?.role === 'ADMIN') {
      Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/bookings').then(r => r.json()),
        fetch('/api/admin/drivers').then(r => r.json()),
      ]).then(([s, b, d]) => {
        setStats(s)
        setBookings(b.bookings || [])
        setDrivers(d.drivers || [])
        setLoading(false)
      })
    }
  }, [status, user?.role])

  const updateBooking = async (id: string, status: string, driverId?: string) => {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, driverId })
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Booking updated!')
      setBookings(prev => prev.map(b => b.id === id ? {...b, ...data.booking} : b))
    } else {
      toast.error('Failed to update')
    }
  }

  const approveDriver = async (id: string, approved: boolean) => {
    const res = await fetch('/api/admin/drivers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved })
    })
    const data = await res.json()
    if (data.success) {
      toast.success(approved ? 'Driver approved!' : 'Driver suspended')
      setDrivers(prev => prev.map(d => d.id === id ? {...d, approved} : d))
    }
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a84c', fontSize: '18px' }}>Loading Admin Panel...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#050505' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', padding: '6px 16px', marginBottom: '16px' }}>
            <span style={{ color: '#c9a84c', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>🔐 Admin Panel</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '300' }}>
            Control <span style={{ color: '#c9a84c', fontStyle: 'italic' }}>Center</span>
          </h1>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {[
              { label: 'Total Bookings', value: stats.totalBookings, icon: '📋' },
              { label: 'Pending', value: stats.pendingBookings, icon: '⏳', alert: stats.pendingBookings > 0 },
              { label: 'Active Drivers', value: stats.totalDrivers, icon: '🚗' },
              { label: 'Total Users', value: stats.totalUsers, icon: '👤' },
              { label: 'Revenue', value: `€${Math.round(stats.revenue)}`, icon: '💰' },
            ].map(s => (
              <div key={s.label} style={{ background: '#0e0e0e', border: s.alert ? '1px solid rgba(201,168,76,0.5)' : '1px solid #1e1e1e', padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {s.alert && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #c9a84c, #f0d080)', animation: 'shimmer 2s infinite' }} />}
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', color: s.alert ? '#c9a84c' : '#e8e8e8', fontWeight: '700' }}>{s.value}</div>
                <div style={{ color: '#666', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {(['overview', 'bookings', 'drivers'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? 'rgba(201,168,76,0.15)' : '#0e0e0e', border: tab === t ? '1px solid #c9a84c' : '1px solid #1e1e1e', color: tab === t ? '#c9a84c' : '#888', padding: '12px 24px', cursor: 'pointer', fontSize: '12px', letterSpacing: '2px', fontWeight: '600', transition: 'all 0.3s', textTransform: 'capitalize' as any }}>
              {t} {t === 'bookings' && `(${bookings.length})`}{t === 'drivers' && `(${drivers.length})`}
            </button>
          ))}
        </div>

        {/* Bookings Table */}
        {tab === 'bookings' && (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                    {['ID', 'Customer', 'Route', 'Date', 'Vehicle', 'Price', 'Status', 'Driver', 'Actions'].map(h => (
                      <th key={h} style={{ color: '#555', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', padding: '12px 16px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #0e0e0e', transition: 'background 0.3s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#0e0e0e'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px', color: '#555', fontSize: '12px' }}>#{b.id.slice(-6).toUpperCase()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '14px' }}>{b.user?.name}</div>
                        <div style={{ color: '#555', fontSize: '12px' }}>{b.user?.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '13px' }}>{b.pickupLocation?.slice(0,20)}</div>
                        <div style={{ color: '#555', fontSize: '12px' }}>→ {b.dropoffLocation?.slice(0,20)}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#888', fontSize: '13px' }}>{new Date(b.pickupDate).toLocaleDateString()}<br />{new Date(b.pickupDate).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</td>
                      <td style={{ padding: '12px 16px', color: '#888', fontSize: '12px' }}>{b.fleetType?.replace(/_/g,' ')}</td>
                      <td style={{ padding: '12px 16px', color: '#c9a84c', fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: '700' }}>€{b.price}</td>
                      <td style={{ padding: '12px 16px' }}><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                      <td style={{ padding: '12px 16px', color: '#888', fontSize: '13px' }}>{b.driver?.name || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {b.status === 'PENDING' && (
                            <>
                              <select style={{ padding: '6px 10px', fontSize: '12px', background: '#161616', border: '1px solid #2a2a2a', color: '#e8e8e8', cursor: 'pointer' }}
                                onChange={e => { if (e.target.value) updateBooking(b.id, 'CONFIRMED', e.target.value) }}
                                defaultValue="">
                                <option value="">Assign Driver</option>
                                {drivers.filter(d => d.approved).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                              </select>
                              <button onClick={() => updateBooking(b.id, 'CANCELLED')} style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', padding: '6px 12px', cursor: 'pointer', fontSize: '11px' }}>Cancel</button>
                            </>
                          )}
                          {b.status === 'CONFIRMED' && (
                            <>
                              <button onClick={() => updateBooking(b.id, 'IN_PROGRESS')} style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', padding: '6px 12px', cursor: 'pointer', fontSize: '11px' }}>Start</button>
                              <button onClick={() => updateBooking(b.id, 'COMPLETED')} style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)', color: '#4caf50', padding: '6px 12px', cursor: 'pointer', fontSize: '11px' }}>Complete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Drivers */}
        {tab === 'drivers' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            {drivers.map(d => (
              <div key={d.id} style={{ background: '#0e0e0e', border: '1px solid #1e1e1e', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px' }}>{d.name}</span>
                    <span style={{ background: d.approved ? 'rgba(76,175,80,0.2)' : 'rgba(255,152,0,0.2)', color: d.approved ? '#4caf50' : '#ff9800', padding: '3px 10px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {d.approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <div style={{ color: '#666', fontSize: '13px' }}>📧 {d.email} · 📞 {d.phone}</div>
                  <div style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>License: {d.licenseNum} · {d.carModel || 'No car info'} {d.carPlate && `(${d.carPlate})`}</div>
                  <div style={{ color: '#444', fontSize: '12px', marginTop: '4px' }}>Joined: {new Date(d.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!d.approved ? (
                    <button onClick={() => approveDriver(d.id, true)} style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.4)', color: '#4caf50', padding: '10px 20px', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Approve Driver</button>
                  ) : (
                    <button onClick={() => approveDriver(d.id, false)} style={{ background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', color: '#f44336', padding: '10px 20px', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Suspend</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: '#0e0e0e', border: '1px solid #1e1e1e', padding: '24px' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', color: '#c9a84c', marginBottom: '20px' }}>Pending Bookings</h3>
              {bookings.filter(b => b.status === 'PENDING').slice(0,5).map(b => (
                <div key={b.id} style={{ borderBottom: '1px solid #161616', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', marginBottom: '2px' }}>{b.user?.name}</div>
                      <div style={{ color: '#666', fontSize: '12px' }}>{b.pickupLocation} → {b.dropoffLocation}</div>
                      <div style={{ color: '#555', fontSize: '11px' }}>{new Date(b.pickupDate).toLocaleDateString()}</div>
                    </div>
                    <div style={{ color: '#c9a84c', fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: '700' }}>€{b.price}</div>
                  </div>
                </div>
              ))}
              {bookings.filter(b => b.status === 'PENDING').length === 0 && <p style={{ color: '#555' }}>No pending bookings</p>}
              <button onClick={() => setTab('bookings')} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#888', padding: '10px 20px', cursor: 'pointer', fontSize: '12px', marginTop: '8px', width: '100%' }}>View All Bookings</button>
            </div>
            <div style={{ background: '#0e0e0e', border: '1px solid #1e1e1e', padding: '24px' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', color: '#c9a84c', marginBottom: '20px' }}>Pending Driver Approvals</h3>
              {drivers.filter(d => !d.approved).slice(0,5).map(d => (
                <div key={d.id} style={{ borderBottom: '1px solid #161616', paddingBottom: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px' }}>{d.name}</div>
                    <div style={{ color: '#666', fontSize: '12px' }}>{d.email}</div>
                    <div style={{ color: '#555', fontSize: '11px' }}>Applied: {new Date(d.createdAt).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => approveDriver(d.id, true)} style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.4)', color: '#4caf50', padding: '8px 14px', cursor: 'pointer', fontSize: '11px' }}>Approve</button>
                </div>
              ))}
              {drivers.filter(d => !d.approved).length === 0 && <p style={{ color: '#555' }}>No pending applications</p>}
              <button onClick={() => setTab('drivers')} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#888', padding: '10px 20px', cursor: 'pointer', fontSize: '12px', marginTop: '8px', width: '100%' }}>View All Drivers</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
