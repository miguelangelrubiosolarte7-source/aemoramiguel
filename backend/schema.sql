-- ==============================================================================
-- AEMORA SOCIAL NETWORK - DATABASE DDL SPECIFICATION (PostgreSQL / pgAdmin)
-- Standards: OWASP Top 10 Compliant, UUID v4 Primary Keys, Indexed Relational Schema
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
    END IF;
END$$;

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(20) DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    ai_generated BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. LIKES TABLE
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_post_like UNIQUE (user_id, post_id)
);

-- 6. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. AI AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    prompt_hash VARCHAR(64) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    tokens_used INTEGER DEFAULT 0 NOT NULL,
    sanitized_flag BOOLEAN DEFAULT FALSE NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==============================================================================
-- 9. PERFORMANCE & SECURITY INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

CREATE INDEX IF NOT EXISTS idx_ai_audit_user_id ON ai_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_created_at ON ai_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_audit_prompt_hash ON ai_audit_logs(prompt_hash);

-- ==============================================================================
-- 10. AUTOMATIC TIMESTAMP TRIGGER FOR UPDATES
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_update_users_updated_at ON users;
CREATE TRIGGER trg_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_update_posts_updated_at ON posts;
CREATE TRIGGER trg_update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 11. SEED DATA
-- ==============================================================================

INSERT INTO users (id, username, email, password_hash, display_name, avatar_url, bio, role, is_active, is_verified)
VALUES
    (
        'a0000000-0000-4000-8000-000000000001',
        'aemora_core',
        'core@aemora.io',
        '$2b$12$K1nZ3e2O.z9aFk2c1gL9EuH3g7G8l0K2p1Z4x3c6v8b9n0m1a2b3c',
        'Aemora Architecture',
        'https://api.dicebear.com/7.x/bottts/svg?seed=AemoraCore',
        'Kernel y Arquitectura Principal de Aemora Social Network.',
        'admin',
        TRUE,
        TRUE
    ),
    (
        'b0000000-0000-4000-8000-000000000002',
        'elena_security',
        'elena@aemora.io',
        '$2b$12$K1nZ3e2O.z9aFk2c1gL9EuH3g7G8l0K2p1Z4x3c6v8b9n0m1a2b3c',
        'Elena Rostova',
        'https://api.dicebear.com/7.x/bottts/svg?seed=ElenaRostova',
        'Ingeniera de Seguridad Web y Criptografía en Aemora.',
        'user',
        TRUE,
        TRUE
    )
ON CONFLICT (username) DO NOTHING;

INSERT INTO posts (id, author_id, content, tags, ai_generated)
VALUES
    (
        'c0000000-0000-4000-8000-000000000001',
        'a0000000-0000-4000-8000-000000000001',
        'El backend empresarial de Aemora está oficialmente desplegado en FastAPI + PostgreSQL con asyncpg. Blindaje total OWASP Top 10.',
        ARRAY['Aemora', 'FastAPI', 'CyberSecurity', 'PostgreSQL'],
        FALSE
    ),
    (
        'c0000000-0000-4000-8000-000000000002',
        'b0000000-0000-4000-8000-000000000002',
        'Implementamos mitigación activa contra Prompt Injection y Rate Limiting adaptativo con SlowAPI. La seguridad Zero-Trust es el estándar.',
        ARRAY['OWASP', 'InfoSec', 'ZeroTrust'],
        FALSE
    )
ON CONFLICT (id) DO NOTHING;