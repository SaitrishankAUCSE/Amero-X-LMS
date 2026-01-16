# Amero X - Professional Learning Management System

A full-stack, production-ready Learning Management System (LMS) built with Next.js 14, Supabase, Stripe, and Tailwind CSS.

## 🚀 Features

### Authentication & Authorization
- ✅ Complete signup/login flow with email verification
- ✅ Forgot password & reset password functionality
- ✅ Role-based access control (Student, Instructor, Admin)
- ✅ Protected routes with middleware
- ✅ Secure session management

### Course Management
- ✅ Browse courses with advanced filters (category, level, search)
- ✅ Course detail pages with comprehensive information
- ✅ Video lessons with order management
- ✅ Course enrollment system
- ✅ Progress tracking
- ✅ Course ratings and reviews

### Payment Integration
- ✅ Stripe checkout integration
- ✅ Secure payment processing
- ✅ Automatic enrollment after payment
- ✅ Webhook handling for payment confirmation
- ✅ Support for Razorpay (configuration ready)

### Student Dashboard
- ✅ Personal dashboard with learning statistics
- ✅ My Courses page with progress indicators
- ✅ Continue learning feature
- ✅ Course completion tracking
- ✅ Certificate generation (structure ready)

### UI/UX
- ✅ Modern, professional design
- ✅ Dark/Light mode support
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Smooth animations and transitions
- ✅ Toast notifications
- ✅ Loading states and skeletons

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe, Razorpay (ready)
- **State Management**: React Hooks
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd lms-platform
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run the database migration:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and run `supabase/schema.sql`

### 3. Set Up Stripe

1. Create account at [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard > Developers > API keys
3. Set up webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
lms-platform/
├── src/
│   ├── app/                   # Next.js app router pages
│   │   ├── (auth)/           # Auth pages (login, signup, etc.)
│   │   ├── api/              # API routes
│   │   ├── courses/          # Course listing & details
│   │   ├── dashboard/        # Student dashboard
│   │   ├── payment/          # Payment success/cancel pages
│   │   └── page.tsx          # Landing page
│   ├── components/           # Reusable components
│   ├── lib/                  # Utilities and helpers
│   │   ├── supabase.ts      # Supabase client
│   │   └── auth.ts          # Auth functions
│   └── middleware.ts         # Route protection
├── supabase/
│   └── schema.sql           # Database schema
└── .env.local               # Environment variables
```

## 🗄️ Database Schema

- **profiles**: User profiles with roles
- **categories**: Course categories
- **courses**: Course information
- **lessons**: Video lessons
- **enrollments**: User course enrollments
- **lesson_progress**: Progress tracking
- **reviews**: Course reviews
- **payments**: Payment records
- **wishlist**: Saved courses
- **certificates**: Generated certificates

## 🔐 Role-Based Access

### Student (Default)
- Browse and purchase courses
- Access enrolled courses
- Track progress
- View certificates

### Instructor
- Create and manage courses
- Upload lessons
- View student analytics
- Manage revenue

### Admin
- Manage all users
- Approve/reject courses
- View platform analytics
- Manage payments

## 💳 Payment Flow

1. User clicks "Enroll Now"
2. API creates Stripe checkout session
3. User redirects to Stripe
4. After payment, webhook fires
5. System auto-enrolls user
6. Redirect to success page
7. User can access course

## 🎨 Customization

### Brand Colors

Edit `src/app/globals.css`:

```css
:root {
  --primary: 142 76% 36%;  /* Your brand color */
}
```

### Logo

Replace logo in `src/components/navbar.tsx`

## 📝 Testing the System

### Create First Admin

After signup, manually update your role in Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id';
```

### Create Sample Course

1. Sign up as instructor (or update role)
2. Go to `/instructor/courses/new`
3. Create course with lessons
4. Publish course

### Test Payment Flow

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

Configure environment variables in Vercel dashboard.

### Environment Setup

1. Add all environment variables
2. Update NEXT_PUBLIC_APP_URL to production URL
3. Configure Stripe webhook with production URL
4. Enable RLS in Supabase (already configured)

## 📚 API Routes

- `POST /api/checkout` - Create Stripe session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

## 🐛 Troubleshooting

### Middleware Errors
Ensure Supabase keys are in `.env.local`

### Payment Webhook Not Firing
- Use Stripe CLI for local testing
- Verify webhook secret matches

### Database Connection
Check Supabase project status and RLS policies

## 🤝 Contributing

This is a proprietary LMS platform. For issues or feature requests, contact the development team.

## 📄 License

Proprietary - All Rights Reserved

## 🆘 Support

For setup help:
1. Check environment variables
2. Verify Supabase migration ran
3. Test Stripe keys in test mode
4. Review browser console for errors

---

**Built with ❤️ using Next.js, Supabase, and Stripe**
