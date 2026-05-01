import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendDriverApprovalEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const drivers = await prisma.driver.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ drivers })
  } catch(e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const admin = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { id, approved } = await req.json()
    const driver = await prisma.driver.update({ where: { id }, data: { approved } })
    if (approved) { try { await sendDriverApprovalEmail(driver) } catch(e) {} }
    return NextResponse.json({ success: true, driver })
  } catch(e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
