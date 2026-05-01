import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendBookingConfirmationToUser(booking: any, user: any) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Booking Confirmed</title></head>
    <body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:0;">
      <div style="max-width:600px;margin:0 auto;background:#111;border:1px solid #c9a84c;">
        <div style="background:linear-gradient(135deg,#c9a84c,#f0d080);padding:30px;text-align:center;">
          <h1 style="color:#000;margin:0;font-size:28px;">🚗 BOOKING CONFIRMED</h1>
          <p style="color:#000;margin:5px 0;">Barcelona Premium Transfers</p>
        </div>
        <div style="padding:30px;">
          <p style="color:#c9a84c;font-size:18px;">Dear ${user.name},</p>
          <p>Your transfer has been successfully booked! Here are your details:</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr style="border-bottom:1px solid #333;">
              <td style="padding:10px;color:#999;">Booking ID</td>
              <td style="padding:10px;color:#c9a84c;font-weight:bold;">#${booking.id.slice(-8).toUpperCase()}</td>
            </tr>
            <tr style="border-bottom:1px solid #333;">
              <td style="padding:10px;color:#999;">From</td>
              <td style="padding:10px;">${booking.pickupLocation}</td>
            </tr>
            <tr style="border-bottom:1px solid #333;">
              <td style="padding:10px;color:#999;">To</td>
              <td style="padding:10px;">${booking.dropoffLocation}</td>
            </tr>
            <tr style="border-bottom:1px solid #333;">
              <td style="padding:10px;color:#999;">Date & Time</td>
              <td style="padding:10px;">${new Date(booking.pickupDate).toLocaleString()}</td>
            </tr>
            <tr style="border-bottom:1px solid #333;">
              <td style="padding:10px;color:#999;">Vehicle</td>
              <td style="padding:10px;">${booking.fleetType}</td>
            </tr>
            <tr>
              <td style="padding:10px;color:#999;">Total Price</td>
              <td style="padding:10px;color:#c9a84c;font-size:20px;font-weight:bold;">€${booking.price}</td>
            </tr>
          </table>
          <p style="color:#999;font-size:14px;">You will receive another email when a driver is assigned to your booking.</p>
          <div style="text-align:center;margin:20px 0;">
            <a href="${process.env.NEXTAUTH_URL}/user/bookings" style="background:linear-gradient(135deg,#c9a84c,#f0d080);color:#000;padding:12px 30px;text-decoration:none;font-weight:bold;border-radius:4px;">VIEW MY BOOKING</a>
          </div>
        </div>
        <div style="background:#0a0a0a;padding:20px;text-align:center;color:#666;font-size:12px;">
          <p>Barcelona Premium Transfers | +34 XXX XXX XXX | info@barcelonatransfers.com</p>
        </div>
      </div>
    </body>
    </html>
  `
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: `✅ Booking Confirmed - #${booking.id.slice(-8).toUpperCase()} | Barcelona Transfers`,
    html
  })
}

export async function sendNewBookingToAdmin(booking: any, user: any) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#111;border:1px solid #c9a84c;padding:30px;">
        <h1 style="color:#c9a84c;">🔔 NEW BOOKING RECEIVED</h1>
        <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
        <p><strong>From:</strong> ${booking.pickupLocation}</p>
        <p><strong>To:</strong> ${booking.dropoffLocation}</p>
        <p><strong>Date:</strong> ${new Date(booking.pickupDate).toLocaleString()}</p>
        <p><strong>Vehicle:</strong> ${booking.fleetType}</p>
        <p><strong>Passengers:</strong> ${booking.passengers}</p>
        <p><strong>Price:</strong> <span style="color:#c9a84c;font-size:20px;">€${booking.price}</span></p>
        <a href="${process.env.NEXTAUTH_URL}/admin/bookings" style="background:#c9a84c;color:#000;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;margin-top:20px;">MANAGE BOOKING</a>
      </div>
    </body>
    </html>
  `
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_USER,
    subject: `🚗 NEW BOOKING #${booking.id.slice(-8).toUpperCase()} - €${booking.price}`,
    html
  })
}

export async function sendDriverAssignmentEmail(booking: any, driver: any, user: any) {
  const userHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#111;border:1px solid #c9a84c;padding:30px;">
        <h1 style="color:#c9a84c;">🚗 YOUR DRIVER HAS BEEN ASSIGNED!</h1>
        <p>Great news! A driver has been assigned to your transfer.</p>
        <div style="background:#1a1a1a;padding:20px;border-left:4px solid #c9a84c;margin:20px 0;">
          <h3 style="color:#c9a84c;margin:0 0 10px;">Driver Details</h3>
          <p style="margin:5px 0;"><strong>Name:</strong> ${driver.name}</p>
          <p style="margin:5px 0;"><strong>Phone:</strong> ${driver.phone}</p>
          <p style="margin:5px 0;"><strong>Vehicle:</strong> ${driver.carModel || booking.fleetType}</p>
          <p style="margin:5px 0;"><strong>Plate:</strong> ${driver.carPlate || 'TBC'}</p>
        </div>
        <p style="color:#999;font-size:14px;">Booking: #${booking.id.slice(-8).toUpperCase()}</p>
      </div>
    </body>
    </html>
  `
  
  const driverHtml = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#111;border:1px solid #c9a84c;padding:30px;">
        <h1 style="color:#c9a84c;">📍 NEW RIDE ASSIGNED TO YOU</h1>
        <p>You have been assigned a new transfer booking.</p>
        <p><strong>Passenger:</strong> ${user.name}</p>
        <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
        <p><strong>Pickup:</strong> ${booking.pickupLocation}</p>
        <p><strong>Drop-off:</strong> ${booking.dropoffLocation}</p>
        <p><strong>Date:</strong> ${new Date(booking.pickupDate).toLocaleString()}</p>
        <p><strong>Passengers:</strong> ${booking.passengers}</p>
        <p><strong>Vehicle:</strong> ${booking.fleetType}</p>
        ${booking.flightNumber ? `<p><strong>Flight:</strong> ${booking.flightNumber}</p>` : ''}
        ${booking.specialNotes ? `<p><strong>Notes:</strong> ${booking.specialNotes}</p>` : ''}
        <a href="${process.env.NEXTAUTH_URL}/driver/bookings" style="background:#c9a84c;color:#000;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;margin-top:20px;">VIEW BOOKING</a>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({ from: process.env.SMTP_FROM, to: user.email, subject: `🚗 Driver Assigned - Booking #${booking.id.slice(-8).toUpperCase()}`, html: userHtml })
  await transporter.sendMail({ from: process.env.SMTP_FROM, to: driver.email, subject: `📍 New Ride Assignment - #${booking.id.slice(-8).toUpperCase()}`, html: driverHtml })
}

export async function sendWelcomeEmail(user: any) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#111;border:1px solid #c9a84c;padding:30px;text-align:center;">
        <h1 style="color:#c9a84c;">Welcome to Barcelona Transfers!</h1>
        <p>Hello ${user.name}, your account has been created successfully.</p>
        <p>Book your first premium transfer in minutes.</p>
        <a href="${process.env.NEXTAUTH_URL}/booking" style="background:linear-gradient(135deg,#c9a84c,#f0d080);color:#000;padding:15px 40px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;margin-top:20px;font-size:16px;">BOOK NOW</a>
      </div>
    </body>
    </html>
  `
  await transporter.sendMail({ from: process.env.SMTP_FROM, to: user.email, subject: `Welcome to Barcelona Premium Transfers! 🚗`, html })
}

export async function sendDriverApprovalEmail(driver: any) {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#111;border:1px solid #c9a84c;padding:30px;text-align:center;">
        <h1 style="color:#c9a84c;">🎉 You're Approved!</h1>
        <p>Hello ${driver.name}, your driver account has been approved!</p>
        <p>You can now log in and start accepting rides.</p>
        <a href="${process.env.NEXTAUTH_URL}/driver/login" style="background:#c9a84c;color:#000;padding:15px 40px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;margin-top:20px;">LOGIN NOW</a>
      </div>
    </body>
    </html>
  `
  await transporter.sendMail({ from: process.env.SMTP_FROM, to: driver.email, subject: `✅ Driver Account Approved - Barcelona Transfers`, html })
}
