-- ============================================================
-- SCHEMESMART - Supabase PostgreSQL + pgvector Database Schema
-- ============================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create SCHEMES Table
CREATE TABLE IF NOT EXISTS schemes (
    id BIGSERIAL PRIMARY KEY,
    scheme_id VARCHAR(64) UNIQUE NOT NULL,
    slug VARCHAR(255) NOT NULL,
    name TEXT NOT NULL,
    name_tamil TEXT,
    description TEXT NOT NULL,
    description_tamil TEXT,
    ministry TEXT,
    department TEXT,
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    category VARCHAR(100) NOT NULL,
    beneficiary_type VARCHAR(150),
    benefits TEXT,
    eligibility_text TEXT NOT NULL,
    eligibility_text_tamil TEXT,
    application_process TEXT,
    application_process_tamil TEXT,
    documents_required TEXT,
    documents_required_tamil TEXT,
    apply_url TEXT,
    official_url TEXT,
    eligibility_age_min INTEGER,
    eligibility_age_max INTEGER,
    eligibility_gender VARCHAR(30) DEFAULT 'all', -- 'all', 'female', 'male', 'transgender'
    eligibility_caste VARCHAR(100) DEFAULT 'all', -- 'all', 'SC', 'ST', 'BC', 'MBC', 'General'
    eligibility_income_max BIGINT,
    eligibility_residence VARCHAR(100) DEFAULT 'Tamil Nadu',
    eligibility_state VARCHAR(100) DEFAULT 'Tamil Nadu',
    eligibility_disability BOOLEAN DEFAULT FALSE,
    eligibility_bpl BOOLEAN DEFAULT FALSE,
    application_mode VARCHAR(50) DEFAULT 'offline', -- 'online', 'offline', 'hybrid'
    url_status VARCHAR(50) DEFAULT 'active',
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    embedding vector(384) -- pgvector 384-dim embedding
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_state ON schemes(state);
CREATE INDEX IF NOT EXISTS idx_schemes_beneficiary ON schemes(beneficiary_type);
CREATE INDEX IF NOT EXISTS idx_schemes_application_mode ON schemes(application_mode);
CREATE INDEX IF NOT EXISTS idx_schemes_slug ON schemes(slug);

-- pgvector cosine similarity index
CREATE INDEX IF NOT EXISTS idx_schemes_embedding ON schemes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 3. Create USERS Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    age INTEGER,
    gender VARCHAR(30),
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    district VARCHAR(100),
    occupation VARCHAR(150),
    income BIGINT,
    caste VARCHAR(100),
    community VARCHAR(100),
    disability BOOLEAN DEFAULT FALSE,
    bpl BOOLEAN DEFAULT FALSE,
    student BOOLEAN DEFAULT FALSE,
    farmer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create DOCUMENTS Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'missing', 'unclear'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. pgvector Semantic Search Stored Procedure
CREATE OR REPLACE FUNCTION match_schemes (
    query_embedding vector(384),
    match_threshold float,
    match_count int
)
RETURNS TABLE (
    id BIGINT,
    scheme_id VARCHAR(64),
    slug VARCHAR(255),
    name TEXT,
    name_tamil TEXT,
    category VARCHAR(100),
    beneficiary_type VARCHAR(150),
    description TEXT,
    benefits TEXT,
    eligibility_text TEXT,
    documents_required TEXT,
    application_process TEXT,
    apply_url TEXT,
    official_url TEXT,
    application_mode VARCHAR(50),
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.scheme_id,
        s.slug,
        s.name,
        s.name_tamil,
        s.category,
        s.beneficiary_type,
        s.description,
        s.benefits,
        s.eligibility_text,
        s.documents_required,
        s.application_process,
        s.apply_url,
        s.official_url,
        s.application_mode,
        1 - (s.embedding <=> query_embedding) AS similarity
    FROM schemes s
    WHERE s.embedding IS NOT NULL AND 1 - (s.embedding <=> query_embedding) > match_threshold
    ORDER BY s.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
