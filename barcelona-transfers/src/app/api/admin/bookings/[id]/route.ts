import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendDriverAssignmentEmail } from '@/lib/email'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const admin = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { status, driverId } = await req.json()
    const data: any = { status }
    if (driverId) data.driverId = driverId
    const booking = await prisma.booking.update({ where: { id: params.id }, data, include: { user: true, driver: true } })
    if (driverId && booking.driver) {
      try { await sendDriverAssignmentEmail(booking, booking.driver, booking.user) } catch(e) {}
      await prisma.notification.create({ data: { userId: booking.userId, title: 'Driver Assigned!', message: `${booking.driver.name} will be your driver. Phone: ${booking.driver.phone}`, type: 'DRIVER_ASSIGNED' } })
      await prisma.notification.create({ data: { driverId, title: 'New Ride!', message: `New ride from ${booking.pickupLocation} to ${booking.dropoffLocation}`, type: 'NEW_RIDE' } })
    }
    return NextResponse.json({ success: true, booking })
  } catch(e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
