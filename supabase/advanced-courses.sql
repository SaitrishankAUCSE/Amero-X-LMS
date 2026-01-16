-- Seeding Advanced Courses for Blockchain LMS
-- Categories: Blockchain, AI/ML, Cryptography

DO $$
DECLARE
  blockchain_id UUID;
  ai_ml_id UUID;
  crypto_id UUID;
  instructor_id UUID;
BEGIN
  -- 1. Upsert Categories
  INSERT INTO categories (name, slug, description)
  VALUES 
    ('AI & Machine Learning', 'ai-ml', 'Explore artificial intelligence, neural networks, and machine learning models.'),
    ('Cryptography', 'cryptography', 'The science of secure communication and digital assets.'),
    ('Smart Contracts', 'smart-contracts', 'Learn to build decentralized logic on Ethereum and other blockchains.')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

  -- Get Category IDs
  SELECT id INTO blockchain_id FROM categories WHERE slug = 'blockchain' LIMIT 1;
  SELECT id INTO ai_ml_id FROM categories WHERE slug = 'ai-ml' LIMIT 1;
  SELECT id INTO crypto_id FROM categories WHERE slug = 'cryptography' LIMIT 1;

  -- 2. Get an Instructor (or use the one created in sample-courses.sql)
  SELECT id INTO instructor_id FROM profiles WHERE role = 'instructor' LIMIT 1;
  
  -- If no instructor, create one
  IF instructor_id IS NULL THEN
    INSERT INTO profiles (id, full_name, role, bio)
    VALUES (gen_random_uuid(), 'Satoshi Nakamoto', 'instructor', 'Founder of decentralized education.')
    RETURNING id INTO instructor_id;
  END IF;

  -- 3. Insert Courses & Lessons
  DECLARE
    course_ai_id UUID;
    course_crypto_id UUID;
    course_solidity_id UUID;
  BEGIN
    -- AI/ML Courses
    INSERT INTO courses (title, slug, description, short_description, price, instructor_id, category_id, level, is_published, thumbnail_url)
    VALUES (
      'Deep Learning for Web3',
      'deep-learning-web3',
      'Learn how to integrate neural networks with decentralized applications. This course covers AI-driven smart contracts, decentralized model training, and on-chain inference.',
      'Neural networks meet decentralized logic.',
      149.00,
      instructor_id,
      ai_ml_id,
      'advanced',
      true,
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'
    ) ON CONFLICT (slug) DO UPDATE SET id = courses.id RETURNING id INTO course_ai_id;

    -- Lessons for AI Course
    INSERT INTO lessons (course_id, title, description, video_url, order_index, is_free)
    VALUES 
      (course_ai_id, 'Introduction to Decentralized AI', 'Overview of the intersection between AI and Blockchain. [Download Resource PDF](https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf)', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, true),
      (course_ai_id, 'Neural Networks on IPFS', 'How to store and serve model weights using decentralized storage. [Model Weights Prep PDF](https://www.adobe.com/support/products/enterprise/knowledgecenter/whitepapers/pdf/aace_security.pdf)', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2, false),
      (course_ai_id, 'On-chain Inference with ZK', 'Privacy-preserving AI computation on Ethereum. [ZK-ML Whitepaper](https://www.zkml.org/resources/whitepaper.pdf)', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3, false);

    -- Crypto Courses
    INSERT INTO courses (title, slug, description, short_description, price, instructor_id, category_id, level, is_published, thumbnail_url)
    VALUES (
      'Advanced Cryptography & ZK-Proofs',
      'advanced-crypto-zkp',
      'Master Zero-Knowledge Proofs (zk-SNARKs, zk-STARKs) and advanced cryptographic primitives used in modern privacy protocols.',
      'Privacy-preserving tech at its finest.',
      199.00,
      instructor_id,
      crypto_id,
      'advanced',
      true,
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800'
    ) ON CONFLICT (slug) DO UPDATE SET id = courses.id RETURNING id INTO course_crypto_id;

    -- Lessons for Crypto Course
    INSERT INTO lessons (course_id, title, description, video_url, order_index, is_free)
    VALUES 
      (course_crypto_id, 'The Hash Function Landscape', 'Deep dive into SHA-256, Keccak, and Poseidon. [Hashing Tutorial PDF](https://www.cs.princeton.edu/~rs/AlgsDS07/11Hashing.pdf)', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, true),
      (course_crypto_id, 'Intro to Zero-Knowledge Proofs', 'Understanding the math behind ZKPs. [ZK-Proofs Reference PDF](https://people.cs.georgetown.edu/~jthaler/ZKbook.pdf)', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2, false),
      (course_crypto_id, 'Building a ZK-Rollup', 'Architecture of a basic L2 rollup using ZKPs. [Rollup Design PDF](https://vitalik.eth.limo/general/2021/01/05/rollup.html)', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3, false);

    -- Blockchain Courses
    INSERT INTO courses (title, slug, description, short_description, price, instructor_id, category_id, level, is_published, thumbnail_url)
    VALUES (
      'Solidity Smart Contract Security',
      'solidity-security',
      'Learn to write secure code and prevent reentrancy attacks, frontrunning, and logic flaws in DeFi protocols.',
      'Secure your protocols today.',
      129.00,
      instructor_id,
      blockchain_id,
      'intermediate',
      true,
      'https://images.unsplash.com/photo-16397626801057-074b7f938ba0?w=800'
    ) ON CONFLICT (slug) DO UPDATE SET id = courses.id RETURNING id INTO course_solidity_id;

    -- Lessons for Solidity Course
    INSERT INTO lessons (course_id, title, description, video_url, order_index, is_free)
    VALUES 
      (course_solidity_id, 'The Security Mindset', 'Why security is different in Web3.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1, true),
      (course_solidity_id, 'Common Attack Vectors', 'Reentrancy, Integer Overflow, and Logic flaws. [Cheat Sheet PDF](https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf)', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2, false),
      (course_solidity_id, 'Auditing Your First Protocol', 'Manual analysis vs static analysis tools.', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3, false);
  END;

END $$;
