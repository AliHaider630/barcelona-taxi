#!/bin/bash
echo "🚗 Barcelona Transfers - Setup Script"
echo "======================================"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Setting up database..."
npx prisma generate
npx prisma db push

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Edit .env.local with your email/SMTP settings"
echo "  2. Run: npm run dev"
echo "  3. Visit: http://localhost:3000"
echo "  4. Create admin: curl -X POST http://localhost:3000/api/admin/seed"
echo ""
echo "🔐 Test accounts (after seed):"
echo "  Admin: admin@barcelonatransfers.com / admin123"
echo "  Driver: driver@barcelonatransfers.com / driver123"
