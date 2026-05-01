import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }
  try {
    const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@barcelonatransfers.com' } })
    if (!existingAdmin) {
      const hash = await bcrypt.hash('admin123', 12)
      await prisma.user.create({ data: { name: 'Admin', email: 'admin@barcelonatransfers.com', password: hash, role: 'ADMIN' } })
    }
    const existingDriver = await prisma.driver.findUnique({ where: { email: 'driver@barcelonatransfers.com' } })
    if (!existingDriver) {
      const hash = await bcrypt.hash('driver123', 12)
      await prisma.driver.create({ data: { name: 'Carlos Pérez', email: 'driver@barcelonatransfers.com', phone: '+34 600 123 456', password: hash, licenseNum: 'B123456', carModel: 'Mercedes E-Class', carPlate: '1234 BCN', approved: true } })
    }
    return NextResponse.json({ success: true, message: 'Seed complete. Admin: admin@barcelonatransfers.com / admin123 | Driver: driver@barcelonatransfers.com / driver123' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
