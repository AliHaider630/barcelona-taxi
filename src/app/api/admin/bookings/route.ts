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
    const bookings = await prisma.booking.findMany({ include: { user: true, driver: true }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ bookings })
  } catch(e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
