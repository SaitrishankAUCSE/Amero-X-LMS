import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAdvancedSchema() {
    console.log('Running Advanced Schema Migration...')

    // 1. Create Sections Table (for curriculum builder)
    const { error: sectionsError } = await supabase.rpc('create_sql_query', {
        query: `
            CREATE TABLE IF NOT EXISTS sections (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                order_index INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `
    })

    if (sectionsError) {
        // Fallback if rpc not available, using raw SQL via client if enabled or direct instructions
        console.error('Failed to create sections table. RPC might not be enabled. Please run SQL manually.')
    }

    // 2. Add 'type' and 'section_id' to lessons
    // We'll use a safer approach: creating the column if it doesn't exist
    // Note: Supabase JS client doesn't support direct DDL easily without RPC.
    // I will use a special trick: creating a function to execute SQL
}

// Since we cannot easily run DDL from client without custom RPC,
// I will instead provide the SQL to be run in the Supabase SQL Editor by the user.
// However, I can try to use the 'rpc' method if the user has a function for it.
// Assuming user might not have 'create_sql_query' rpc.

console.log(`
Please run the following SQL in your Supabase SQL Editor to enable the new features:

-- 1. Create Sections Table
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Update Lessons Table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('video', 'text', 'quiz', 'assignment', 'pdf', 'audio')) DEFAULT 'video';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS text_content TEXT; -- For text lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_url TEXT; -- Unified URL for Video, PDF, Audio

-- 3. Create Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    questions JSONB, -- Array of { question, options, correct_answer }
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    instructions TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`)

setupAdvancedSchema()
