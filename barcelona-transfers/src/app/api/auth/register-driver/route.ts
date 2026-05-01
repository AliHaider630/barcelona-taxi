import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, licenseNum, carModel, carPlate } = await req.json()
    if (!name || !email || !password || !licenseNum) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const exists = await prisma.driver.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    const hashed = await bcrypt.hash(password, 12)
    await prisma.driver.create({ data: { name, email, phone, password: hashed, licenseNum, carModel, carPlate } })
    return NextResponse.json({ success: true, message: 'Application submitted! Admin will review and approve your account.' })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
