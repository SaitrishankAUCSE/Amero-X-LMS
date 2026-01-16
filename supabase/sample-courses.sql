-- Sample Courses with Dollar Pricing
-- Copy and paste this into Supabase SQL Editor AFTER running schema.sql

-- First, let's get a category ID (using the first one created by schema.sql)
DO $$
DECLARE
  web_dev_category UUID;
  blockchain_category UUID;
  design_category UUID;
  sample_instructor UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO web_dev_category FROM categories WHERE slug = 'web-development' LIMIT 1;
  SELECT id INTO blockchain_category FROM categories WHERE slug = 'blockchain' LIMIT 1;
  SELECT id INTO design_category FROM categories WHERE slug = 'design' LIMIT 1;

  -- Create a sample instructor (you can replace this with your own user ID later)
  INSERT INTO profiles (id, full_name, role, bio)
  VALUES (
    gen_random_uuid(),
    'John Smith',
    'instructor',
    'Expert developer with 10+ years of experience in web development and teaching.'
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO sample_instructor;

  -- If no instructor was created (conflict), get any instructor
  IF sample_instructor IS NULL THEN
    SELECT id INTO sample_instructor FROM profiles WHERE role = 'instructor' LIMIT 1;
  END IF;

  -- Insert Sample Courses with Dollar Pricing
  
  -- Course 1 ($89.00)
  INSERT INTO courses (
    title,
    slug,
    description,
    short_description,
    thumbnail_url,
    price,
    instructor_id,
    category_id,
    level,
    language,
    is_published
  ) VALUES (
    'Premium Education Course Alpha',
    'premium-course-alpha',
    'Master high-level skills with our flagship education program. This course covers everything from fundamentals to advanced concepts in a structured and easy-to-follow format.',
    'Comprehensive mastery in a single program',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    89.00,
    COALESCE(sample_instructor, (SELECT id FROM profiles LIMIT 1)),
    web_dev_category,
    'beginner',
    'English',
    true
  );

  -- Course 2 ($129.00)
  INSERT INTO courses (
    title,
    slug,
    description,
    short_description,
    thumbnail_url,
    price,
    instructor_id,
    category_id,
    level,
    language,
    is_published
  ) VALUES (
    'Premium Education Course Beta',
    'premium-course-beta',
    'Deep dive into professional workflows and industry-standard tools. Learn how to build production-ready projects and master complex architectures.',
    'Advanced professional skills masterclass',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    129.00,
    COALESCE(sample_instructor, (SELECT id FROM profiles LIMIT 1)),
    web_dev_category,
    'advanced',
    'English',
    true
  );

  -- Course 3 ($49.00)
  INSERT INTO courses (
    title,
    slug,
    description,
    short_description,
    thumbnail_url,
    price,
    instructor_id,
    category_id,
    level,
    language,
    is_published
  ) VALUES (
    'Premium Education Course Gamma',
    'premium-course-gamma',
    'A focused guide on creative solutions and design principles. Build a stunning portfolio and understand the core of modern aesthetics.',
    'Design your future with expert guidance',
    'https://images.unsplash.com/photo-1541462608141-ad4d01947f9d?w=800',
    49.00,
    COALESCE(sample_instructor, (SELECT id FROM profiles LIMIT 1)),
    design_category,
    'beginner',
    'English',
    true
  );

  -- Course 4 ($67.00)
  INSERT INTO courses (
    title,
    slug,
    description,
    short_description,
    thumbnail_url,
    price,
    instructor_id,
    category_id,
    level,
    language,
    is_published
  ) VALUES (
    'Premium Education Course Delta',
    'premium-course-delta',
    'Unlock the power of logic and structured thinking. This course provides the building blocks for any technical career path.',
    'Foundation for technical excellence',
    'https://images.unsplash.com/photo-1454165833767-027ffea70215?w=800',
    67.00,
    COALESCE(sample_instructor, (SELECT id FROM profiles LIMIT 1)),
    web_dev_category,
    'beginner',
    'English',
    true
  );

  -- Course 5 ($199.00)
  INSERT INTO courses (
    title,
    slug,
    description,
    short_description,
    thumbnail_url,
    price,
    instructor_id,
    category_id,
    level,
    language,
    is_published
  ) VALUES (
    'Premium Education Course Epsilon',
    'premium-course-epsilon',
    'Our most comprehensive technical program. Learn full-stack orchestration, deployment, and high-level management of complex systems.',
    'The ultimate technical leadership program',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    199.00,
    COALESCE(sample_instructor, (SELECT id FROM profiles LIMIT 1)),
    web_dev_category,
    'intermediate',
    'English',
    true
  );

  -- Course 6 ($115.00)
  INSERT INTO courses (
    title,
    slug,
    description,
    short_description,
    thumbnail_url,
    price,
    instructor_id,
    category_id,
    level,
    language,
    is_published
  ) VALUES (
    'Premium Education Course Zeta',
    'premium-course-zeta',
    'Modern approach to mobile and cross-platform experiences. Learn how to reach users wherever they are with a single codebase.',
    'Build and deploy everywhere',
    'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800',
    115.00,
    COALESCE(sample_instructor, (SELECT id FROM profiles LIMIT 1)),
    web_dev_category,
    'intermediate',
    'English',
    true
  );

END $$;

-- Verify courses were created
SELECT 
  title, 
  price, 
  level,
  is_published
FROM courses
ORDER BY created_at DESC;
