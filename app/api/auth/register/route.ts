import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { name, email, phone, password: hashed } })
    try { await sendWelcomeEmail(user) } catch(e) { console.log('Email error:', e) }
    return NextResponse.json({ success: true, message: 'Account created successfully!' })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
