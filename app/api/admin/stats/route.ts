import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const [totalBookings, pendingBookings, totalUsers, totalDrivers, revenue] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.user.count(),
      prisma.driver.count({ where: { approved: true } }),
      prisma.booking.aggregate({ where: { status: 'COMPLETED' }, _sum: { price: true } })
    ])
    return NextResponse.json({ totalBookings, pendingBookings, totalUsers, totalDrivers, revenue: revenue._sum.price || 0 })
  } catch(e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
