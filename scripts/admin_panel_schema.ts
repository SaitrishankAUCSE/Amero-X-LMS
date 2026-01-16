
// This script provides the SQL commands to set up the Admin Panel features.
// Run these commands in your Supabase SQL Editor.

const sql = `
-- 1. Coupon Control
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER CHECK (discount_percent BETWEEN 0 AND 100),
    discount_amount NUMERIC(10, 2), -- Alternative to percent
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CMS (Blog & Pages)
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT, -- Markdown or HTML
    cover_image TEXT,
    author_id UUID REFERENCES auth.users(id),
    is_published BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'blog', -- 'blog' or 'page'
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Notifications System
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    is_read BOOLEAN DEFAULT false,
    link TEXT, -- Optional action link
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Site Settings (Homepage Builder & SEO)
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Example: key='homepage_hero', value={ "title": "...", "subtitle": "..." }
-- Example: key='seo_global', value={ "site_name": "...", "description": "..." }

-- 5. Analytics (Simulated or Real)
-- We can aggregate data from 'enrollments' and 'transactions' (if exists) for Revenue.
-- For Platform Analytics, we might track page views in a new table if desired, 
-- but usually Google Analytics is preferred. We will stick to DB stats for now.
`

console.log(sql)
