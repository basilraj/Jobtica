-- Jobtica Database Schema for PostgreSQL (Neon)
-- Compatible with Vercel serverless environment

-- Users table for authentication
CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE IF NOT EXISTS "Job" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    application_link VARCHAR(500),
    deadline DATE,
    salary VARCHAR(100),
    type VARCHAR(50) DEFAULT 'full-time',
    status VARCHAR(20) DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    affiliate_courses_json TEXT,
    affiliate_books_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quick Links table
CREATE TABLE IF NOT EXISTS "QuickLink" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Posts table
CREATE TABLE IF NOT EXISTS "ContentPost" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'posts',
    status VARCHAR(20) DEFAULT 'draft',
    slug VARCHAR(255) UNIQUE,
    excerpt TEXT,
    featured_image VARCHAR(500),
    tags JSONB DEFAULT '[]'::jsonb,
    views INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Breaking News table
CREATE TABLE IF NOT EXISTS "BreakingNews" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscribers table
CREATE TABLE IF NOT EXISTS "Subscriber" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    subscription_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    source VARCHAR(100)
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS "ActivityLog" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID,
    ip_address VARCHAR(45)
);

-- Sponsored Ads table
CREATE TABLE IF NOT EXISTS "SponsoredAd" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    link_url VARCHAR(500),
    placement VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    cost_per_click DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contact Submissions table
CREATE TABLE IF NOT EXISTS "ContactSubmission" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    replied_at TIMESTAMP WITH TIME ZONE NULL
);

-- Email Notifications table
CREATE TABLE IF NOT EXISTS "EmailNotification" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE NULL,
    error_message TEXT
);

-- Custom Emails table
CREATE TABLE IF NOT EXISTS "CustomEmail" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    recipient_count INT DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent',
    error_message TEXT
);

-- Email Templates table
CREATE TABLE IF NOT EXISTS "EmailTemplate" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'custom',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Preparation Courses table
CREATE TABLE IF NOT EXISTS "PreparationCourse" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255),
    price DECIMAL(10,2),
    duration VARCHAR(100),
    level VARCHAR(50),
    image_url VARCHAR(500),
    enrollment_link VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0,
    student_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Preparation Books table
CREATE TABLE IF NOT EXISTS "PreparationBook" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    isbn VARCHAR(20),
    price DECIMAL(10,2),
    publisher VARCHAR(255),
    pages INT,
    image_url VARCHAR(500),
    purchase_link VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Upcoming Exams table
CREATE TABLE IF NOT EXISTS "UpcomingExam" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    exam_date DATE NOT NULL,
    application_start DATE,
    application_end DATE,
    description TEXT,
    official_link VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Key-Value Store for settings
CREATE TABLE IF NOT EXISTS "KeyValueStore" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_status ON "Job"(status);
CREATE INDEX IF NOT EXISTS idx_job_created_at ON "Job"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_status ON "ContentPost"(status);
CREATE INDEX IF NOT EXISTS idx_post_type ON "ContentPost"(type);
CREATE INDEX IF NOT EXISTS idx_subscriber_email ON "Subscriber"(email);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON "ActivityLog"(timestamp DESC);

-- Insert default settings
INSERT INTO "KeyValueStore" (key_name, value) VALUES
('adSettings', '{"activeTests": [], "placements": {}}'),
('seoSettings', '{"metaTitle": "", "metaDescription": "", "keywords": ""}'),
('generalSettings', '{"siteName": "Jobtica", "siteDescription": "", "contactEmail": ""}'),
('socialMediaSettings', '{"facebook": "", "twitter": "", "linkedin": "", "instagram": ""}'),
('smtpSettings', '{"host": "", "port": "", "username": "", "password": ""}'),
('rssSettings', '{"enabled": true, "title": "Jobtica RSS Feed", "description": ""}'),
('alertSettings', '{"emailNotifications": true, "pushNotifications": false}'),
('popupAdSettings', '{"enabled": false, "content": "", "frequency": "once"}'),
('themeSettings', '{"primaryColor": "#3B82F6", "secondaryColor": "#6B7280"}'),
('securitySettings', '{"maxLoginAttempts": 5, "lockoutDuration": 900}'),
('demoUserSettings', '{"enabled": false, "username": "demo", "password": "demo123"}'),
('googleSearchConsoleSettings', '{"enabled": false, "siteVerification": ""}')
ON CONFLICT (key_name) DO NOTHING;