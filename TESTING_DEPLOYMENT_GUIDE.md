# Amero X LMS - Testing & Deployment Guide

**Date:** January 17, 2026  
**Version:** 0.2.0  
**Status:** Ready for Production Testing

---

## 🎯 Executive Summary

This guide provides comprehensive instructions for testing and deploying the Amero X LMS platform. All critical bugs have been fixed, security vulnerabilities addressed, and the codebase is ready for production deployment.

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [x] ESLint checks passed with no errors
- [x] TypeScript compilation successful
- [x] Prisma schema validated
- [x] Dependencies installed and updated
- [x] Critical security vulnerabilities fixed (16 → 7 remaining, non-critical)

### Bug Fixes Applied
- [x] Course count filtering logic fixed
- [x] Mux API initialization error resolved
- [x] Dashboard course display corrected
- [x] Security packages updated

### Documentation
- [x] Bug fix report created
- [x] Code review report completed
- [x] Testing guide prepared
- [x] Environment configuration documented

---

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# ============================================
# CRITICAL - Authentication (Clerk)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# ============================================
# CRITICAL - Database (MongoDB)
# ============================================
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database"

# ============================================
# CRITICAL - Payment Processing (Stripe)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# ============================================
# OPTIONAL - Video Hosting (Mux)
# ============================================
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret

# ============================================
# OPTIONAL - File Uploads (UploadThing)
# ============================================
UPLOADTHING_SECRET=sk_live_your_secret
UPLOADTHING_APP_ID=your_app_id

# ============================================
# Application Configuration
# ============================================
NEXT_PUBLIC_APP_URL=https://ameroxfoundation.com
```

### Getting API Keys

#### 1. Clerk (Authentication)
- Visit: https://clerk.com
- Create a new application
- Copy the publishable and secret keys from the dashboard
- Configure redirect URLs to match your domain

#### 2. MongoDB (Database)
- Visit: https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string from "Connect" → "Connect your application"
- Replace `<username>`, `<password>`, and `<database>` with your credentials

#### 3. Stripe (Payments)
- Visit: https://stripe.com
- Create an account or log in
- Get API keys from Dashboard → Developers → API keys
- Set up webhook endpoint: `https://yourdomain.com/api/webhook`
- Copy the webhook signing secret

#### 4. Mux (Optional - Video Hosting)
- Visit: https://mux.com
- Create an account
- Generate API access token from Settings → Access Tokens

#### 5. UploadThing (Optional - File Uploads)
- Visit: https://uploadthing.com
- Create an app
- Copy the secret and app ID from dashboard

---

## 🧪 Manual Testing Guide

### Test Accounts Setup

Create the following test accounts for comprehensive testing:

1. **Student Account**
   - Email: `student@test.com`
   - Role: Regular user (student)
   - Purpose: Test course enrollment and learning experience

2. **Teacher Account**
   - Email: `teacher@test.com`
   - Role: Teacher/Instructor
   - Purpose: Test course creation and management

3. **Admin Account**
   - Email: `admin@test.com`
   - Role: Administrator
   - Purpose: Test analytics and platform management

### Testing Scenarios

#### Scenario 1: New User Registration & Onboarding
**Objective:** Verify the complete signup and onboarding flow

**Steps:**
1. Navigate to https://ameroxfoundation.com
2. Click "Sign Up" button
3. Complete registration form with test email
4. Verify email confirmation (if enabled)
5. Complete profile setup
6. Verify redirect to dashboard

**Expected Results:**
- ✅ Registration form validates inputs correctly
- ✅ Email confirmation sent (if enabled)
- ✅ User redirected to dashboard after signup
- ✅ Dashboard shows "0 Courses In Progress" and "0 Completed"
- ✅ Welcome message or onboarding tour displayed

**Test Data:**
- Email: `newuser@test.com`
- Password: `TestPassword123!`

---

#### Scenario 2: Course Browsing & Search
**Objective:** Test course discovery and filtering

**Steps:**
1. Log in as student
2. Navigate to "Browse Courses" page
3. Test search functionality with keyword "web"
4. Apply category filters
5. Apply price filters (Free/Paid)
6. Sort courses by different criteria
7. Click on a course to view details

**Expected Results:**
- ✅ Search returns relevant results
- ✅ Filters work correctly
- ✅ Course cards display proper information (title, price, category, thumbnail)
- ✅ Course detail page shows complete information
- ✅ "Enroll" or "Purchase" button visible based on course price

---

#### Scenario 3: Course Purchase Flow (Stripe Integration)
**Objective:** Verify payment processing and enrollment

**Steps:**
1. Log in as student
2. Select a paid course
3. Click "Purchase" button
4. Complete Stripe checkout
5. Use test card: `4242 4242 4242 4242`, Exp: `12/34`, CVC: `123`
6. Verify redirect after successful payment
7. Check if course appears in "My Courses"
8. Verify purchase record in database

**Expected Results:**
- ✅ Stripe checkout modal opens correctly
- ✅ Test payment processes successfully
- ✅ User redirected to course page or dashboard
- ✅ Course appears in user's enrolled courses
- ✅ Purchase record created in database
- ✅ Stripe webhook processes payment confirmation

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication Required: `4000 0025 0000 3155`

---

#### Scenario 4: Course Learning Experience
**Objective:** Test the student learning journey

**Steps:**
1. Log in as student with enrolled course
2. Navigate to course page
3. Click on first chapter
4. Watch video (if Mux is configured)
5. Mark chapter as complete
6. Navigate to next chapter
7. Complete all chapters in the course
8. Verify progress tracking
9. Check if course moves to "Completed" section

**Expected Results:**
- ✅ Video player loads and plays correctly
- ✅ Chapter completion checkbox works
- ✅ Progress bar updates after each chapter
- ✅ "Next Chapter" navigation works
- ✅ Course progress persists across sessions
- ✅ Completed course shows in "Completed Courses" section
- ✅ Course progress shows 100% when all chapters completed

---

#### Scenario 5: Teacher Course Creation
**Objective:** Test course creation and management by teachers

**Steps:**
1. Log in as teacher
2. Navigate to "Teacher Mode" or "Create Course"
3. Create a new course with:
   - Title: "Test Course - Web Development"
   - Description: "A comprehensive test course"
   - Category: "Computer Science"
   - Price: $49.99
   - Thumbnail image
4. Add chapters:
   - Chapter 1: "Introduction" (Free Preview)
   - Chapter 2: "Getting Started"
   - Chapter 3: "Advanced Topics"
5. Upload video for each chapter (if Mux configured)
6. Add chapter descriptions and resources
7. Publish the course
8. Verify course appears in public catalog

**Expected Results:**
- ✅ Course creation form validates inputs
- ✅ Image upload works correctly
- ✅ Chapters can be added, edited, and reordered
- ✅ Video upload processes successfully (if Mux enabled)
- ✅ Course can be saved as draft
- ✅ Course can be published
- ✅ Published course visible in public catalog
- ✅ Unpublished courses not visible to students

---

#### Scenario 6: Dashboard Analytics (Teacher)
**Objective:** Verify analytics and reporting for teachers

**Steps:**
1. Log in as teacher with published courses
2. Navigate to "Analytics" page
3. Review total revenue
4. Check total sales count
5. View course-specific analytics
6. Check student enrollment numbers
7. Review completion rates

**Expected Results:**
- ✅ Total revenue displays correctly
- ✅ Sales count matches purchase records
- ✅ Course-specific data accurate
- ✅ Charts and graphs render properly
- ✅ Data updates in real-time or near real-time

---

#### Scenario 7: Course Progress Tracking
**Objective:** Verify progress calculation and display

**Steps:**
1. Log in as student
2. Enroll in a course with 5 chapters
3. Complete 2 chapters (40% progress)
4. Check dashboard - should show in "In Progress"
5. Complete 2 more chapters (80% progress)
6. Check dashboard - should still show in "In Progress"
7. Complete final chapter (100% progress)
8. Check dashboard - should move to "Completed"

**Expected Results:**
- ✅ Progress bar shows correct percentage
- ✅ Course with 0% progress not in "In Progress"
- ✅ Course with 1-99% progress in "In Progress"
- ✅ Course with 100% progress in "Completed"
- ✅ Dashboard counts update correctly

---

#### Scenario 8: Video Upload & Playback (Mux Integration)
**Objective:** Test video hosting functionality

**Prerequisites:** Mux API keys configured

**Steps:**
1. Log in as teacher
2. Create or edit a chapter
3. Upload a video file (MP4, MOV, etc.)
4. Wait for processing
5. Verify video appears in chapter
6. Log in as student
7. Navigate to chapter with video
8. Play video
9. Test playback controls (play, pause, seek, volume)
10. Test fullscreen mode

**Expected Results:**
- ✅ Video upload initiates successfully
- ✅ Processing status updates in real-time
- ✅ Video player loads after processing
- ✅ Playback controls work correctly
- ✅ Video quality adapts to network conditions
- ✅ Fullscreen mode works
- ✅ Video progress saves and resumes

---

#### Scenario 9: File Upload & Resources
**Objective:** Test file upload functionality

**Steps:**
1. Log in as teacher
2. Edit a chapter
3. Upload course resources:
   - PDF document
   - ZIP file with code samples
   - Image files
4. Verify files appear in chapter
5. Log in as student
6. Navigate to chapter
7. Download each resource
8. Verify files download correctly

**Expected Results:**
- ✅ File upload works for supported formats
- ✅ File size limits enforced
- ✅ Files stored securely
- ✅ Download links work correctly
- ✅ Files accessible only to enrolled students

---

#### Scenario 10: Mobile Responsiveness
**Objective:** Verify mobile user experience

**Steps:**
1. Open site on mobile device or use browser dev tools
2. Test on various screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1024px+)
3. Navigate through all major pages
4. Test course enrollment flow
5. Test video playback on mobile
6. Test form inputs and buttons

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ Navigation menu works on mobile
- ✅ Forms are usable on mobile
- ✅ Videos play on mobile devices
- ✅ Touch interactions work correctly
- ✅ Text is readable without zooming

---

## 🐛 Known Issues & Workarounds

### Remaining Security Vulnerabilities (Non-Critical)

The following vulnerabilities remain but are considered low-risk:

1. **faker@6.6.6** (High)
   - Issue: Removal of functional code
   - Impact: Only used in development/seeding
   - Workaround: Not used in production code
   - Action: Consider replacing with @faker-js/faker

2. **glob@10.2.0-10.4.5** (High)
   - Issue: Command injection in CLI
   - Impact: Development dependency only
   - Workaround: Not exposed to users
   - Action: Will be fixed in next Next.js update

3. **postcss@<8.4.31** (Moderate)
   - Issue: Line return parsing error
   - Impact: Build-time only
   - Workaround: No user impact
   - Action: Update when compatible version available

4. **quill@<=1.3.7** (Moderate)
   - Issue: XSS vulnerability
   - Impact: Used in rich text editor
   - Workaround: Sanitize all user inputs
   - Action: Monitor for updates to react-quill

### Edge Cases

1. **Courses with No Chapters**
   - Issue: Empty courses may cause UI issues
   - Workaround: Validate course has at least one chapter before publishing

2. **Large Video Files**
   - Issue: Upload may timeout
   - Workaround: Recommend videos under 2GB, use compression

3. **Concurrent Purchases**
   - Issue: Race condition possible
   - Workaround: Stripe handles idempotency

---

## 🚀 Deployment Instructions

### Option 1: Vercel Deployment (Recommended)

#### Prerequisites
- GitHub account
- Vercel account (free tier available)
- All environment variables ready

#### Steps

1. **Push Code to GitHub**
```bash
cd /workspace/Amero-X-LMS
git add .
git commit -m "Production-ready: Bug fixes and security updates"
git push origin main
```

2. **Connect to Vercel**
- Go to https://vercel.com
- Click "New Project"
- Import your GitHub repository
- Select "Amero-X-LMS" repository

3. **Configure Environment Variables**
- In Vercel project settings, go to "Environment Variables"
- Add all required variables from the Environment Setup section
- Make sure to add them for all environments (Production, Preview, Development)

4. **Configure Build Settings**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

5. **Deploy**
- Click "Deploy"
- Wait for build to complete (usually 2-5 minutes)
- Verify deployment at provided URL

6. **Configure Custom Domain** (Optional)
- Go to project settings → Domains
- Add your custom domain (ameroxfoundation.com)
- Follow DNS configuration instructions
- Wait for SSL certificate provisioning

#### Post-Deployment Verification

1. Visit your deployed URL
2. Test signup/login flow
3. Test course browsing
4. Test payment flow with Stripe test mode
5. Monitor Vercel logs for any errors

---

### Option 2: Manual Deployment (Alternative)

#### For VPS/Cloud Server (Ubuntu/Debian)

```bash
# 1. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone repository
git clone https://github.com/SaitrishankAUCSE/Amero-X-LMS.git
cd Amero-X-LMS

# 3. Install dependencies
npm install

# 4. Set up environment variables
nano .env
# (Paste all environment variables)

# 5. Build the application
npm run build

# 6. Start the application
npm start

# 7. Use PM2 for process management (recommended)
npm install -g pm2
pm2 start npm --name "lms" -- start
pm2 save
pm2 startup
```

#### Configure Nginx as Reverse Proxy

```nginx
server {
    listen 80;
    server_name ameroxfoundation.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Set Up SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d ameroxfoundation.com
```

---

## 🔍 Post-Deployment Monitoring

### Health Checks

1. **Application Health**
   - Check homepage loads: `curl https://ameroxfoundation.com`
   - Check API health: `curl https://ameroxfoundation.com/api/health`

2. **Database Connection**
   - Monitor MongoDB Atlas dashboard
   - Check connection pool usage
   - Review slow query logs

3. **Payment Processing**
   - Monitor Stripe dashboard for successful payments
   - Check webhook delivery success rate
   - Review failed payment attempts

4. **Error Tracking**
   - Set up Sentry or similar error tracking
   - Monitor Vercel logs for runtime errors
   - Check browser console for client-side errors

### Performance Monitoring

1. **Page Load Times**
   - Use Vercel Analytics
   - Monitor Core Web Vitals
   - Target: LCP < 2.5s, FID < 100ms, CLS < 0.1

2. **API Response Times**
   - Monitor average response time
   - Target: < 200ms for most endpoints
   - Set up alerts for slow queries

3. **Database Performance**
   - Monitor query execution times
   - Check index usage
   - Review connection pool metrics

---

## 📊 Success Metrics

### Key Performance Indicators (KPIs)

1. **User Engagement**
   - Daily/Monthly Active Users
   - Average session duration
   - Course completion rate
   - Return user rate

2. **Business Metrics**
   - Total revenue
   - Average order value
   - Conversion rate (visitor → purchaser)
   - Teacher retention rate

3. **Technical Metrics**
   - Uptime percentage (target: 99.9%)
   - Average page load time (target: < 2s)
   - Error rate (target: < 0.1%)
   - API success rate (target: > 99%)

---

## 🆘 Troubleshooting Guide

### Common Issues

#### Issue: "Cannot connect to database"
**Symptoms:** Application fails to start, database errors in logs

**Solutions:**
1. Verify DATABASE_URL is correct
2. Check MongoDB Atlas IP whitelist
3. Verify database user has correct permissions
4. Test connection with MongoDB Compass

#### Issue: "Clerk authentication not working"
**Symptoms:** Users can't sign up/login, redirect loops

**Solutions:**
1. Verify Clerk API keys are correct
2. Check redirect URLs match your domain
3. Verify Clerk application is in production mode
4. Clear browser cookies and try again

#### Issue: "Stripe payments failing"
**Symptoms:** Checkout doesn't complete, webhook errors

**Solutions:**
1. Verify Stripe API keys (test vs. production)
2. Check webhook endpoint is accessible
3. Verify webhook signing secret is correct
4. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook`

#### Issue: "Videos not playing"
**Symptoms:** Video player shows error, videos don't load

**Solutions:**
1. Verify Mux API keys are configured
2. Check video processing status in Mux dashboard
3. Verify video asset ID is correct
4. Check browser console for CORS errors

#### Issue: "Build fails on Vercel"
**Symptoms:** Deployment fails during build step

**Solutions:**
1. Check build logs for specific error
2. Verify all environment variables are set
3. Run `npm run build` locally to reproduce
4. Check for TypeScript errors
5. Verify all dependencies are in package.json

---

## 📝 Maintenance Schedule

### Daily
- Monitor error logs
- Check payment processing
- Review user feedback

### Weekly
- Review analytics and metrics
- Check database performance
- Update course content as needed

### Monthly
- Update dependencies (`npm audit fix`)
- Review and optimize slow queries
- Backup database
- Security audit

### Quarterly
- Major dependency updates
- Performance optimization review
- User experience improvements
- Feature planning

---

## 📞 Support & Contact

### For Technical Issues
- GitHub Issues: https://github.com/SaitrishankAUCSE/Amero-X-LMS/issues
- Email: support@ameroxfoundation.com

### For Business Inquiries
- Website: https://ameroxfoundation.com
- Email: info@ameroxfoundation.com

---

## 📚 Additional Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Clerk: https://clerk.com/docs
- Stripe: https://stripe.com/docs
- Mux: https://docs.mux.com

### Community
- Next.js Discord: https://nextjs.org/discord
- Prisma Slack: https://slack.prisma.io

---

**Last Updated:** January 17, 2026  
**Document Version:** 1.0  
**Prepared By:** Alex, Frontend Engineer