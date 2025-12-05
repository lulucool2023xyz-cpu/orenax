-- ============================================
-- OrenaX Complete Database Schema v2.1
-- COMPREHENSIVE: Merged from 01-conversations + 02-generated-media
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: CONVERSATIONS
-- Stores all chat sessions (v1 Vertex AI & v2 Gemini API)
-- ============================================

DROP TABLE IF EXISTS conversations CASCADE;
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    model TEXT NOT NULL,
    api_version TEXT NOT NULL DEFAULT 'v2' CHECK (api_version IN ('v1', 'v2')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for conversations
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_api_version ON conversations(api_version);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_user_api ON conversations(user_id, api_version);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations (user can only access own data)
CREATE POLICY conversations_select_policy ON conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY conversations_insert_policy ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY conversations_update_policy ON conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY conversations_delete_policy ON conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Service role bypass (for backend operations with service key)
CREATE POLICY conversations_service_role_all ON conversations
    FOR ALL USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE conversations IS 'Stores chat sessions between users and AI models (v1 Vertex AI, v2 Gemini API)';
COMMENT ON COLUMN conversations.api_version IS 'API version: v1 (Vertex AI) or v2 (Gemini API)';
COMMENT ON COLUMN conversations.model IS 'The Gemini model used (e.g., gemini-2.5-flash, gemini-2.5-pro)';

-- ============================================
-- TABLE 2: MESSAGES
-- Stores individual messages within conversations
-- ============================================

DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Metadata examples:
    -- { "finishReason": "STOP", "usageMetadata": {...}, "streaming": true }
    -- { "thoughtsTokenCount": 1234, "grounding": {...} }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at ASC);
CREATE INDEX idx_messages_role ON messages(role);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages (must own parent conversation)
CREATE POLICY messages_select_policy ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY messages_insert_policy ON messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY messages_update_policy ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

CREATE POLICY messages_delete_policy ON messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND conversations.user_id = auth.uid()
        )
    );

-- Service role bypass
CREATE POLICY messages_service_role_all ON messages
    FOR ALL USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON COLUMN messages.role IS 'user = user input, model = AI response, system = system instruction';
COMMENT ON COLUMN messages.metadata IS 'Additional data: finish_reason, usage_metadata, grounding, etc.';

-- ============================================
-- TABLE 3: GENERATED_MEDIA
-- Stores all user-generated media with GCS URLs
-- Images, Videos, Music, Audio (TTS)
-- ============================================

DROP TABLE IF EXISTS generated_media CASCADE;
CREATE TABLE generated_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Media type classification
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'music', 'audio')),
    
    -- REQUIRED: GCS URLs (only store if URL exists - no base64)
    url TEXT NOT NULL CHECK (url LIKE 'https://%'),  -- Public HTTPS URL
    gcs_uri TEXT,                                     -- GCS URI (gs://bucket/path)
    
    -- File info
    filename TEXT,
    mime_type TEXT,
    file_size BIGINT,  -- Size in bytes
    
    -- Generation info
    model TEXT NOT NULL,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,  -- Negative prompt if used
    
    -- API tracking
    api_version TEXT NOT NULL DEFAULT 'v2' CHECK (api_version IN ('v1', 'v2')),
    endpoint TEXT,  -- e.g., 'image/generate', 'video/generate', 'tts/single'
    
    -- Type-specific metadata (JSONB for flexibility)
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Images: { "aspectRatio": "16:9", "resolution": "1024x1024", "seed": 12345 }
    -- Videos: { "duration": 8, "resolution": "1080p", "hasAudio": true, "operationId": "xxx" }
    -- Music:  { "duration": 32.8, "sampleRate": 48000, "format": "wav" }
    -- Audio:  { "voiceName": "Kore", "duration": 5.2, "speakerCount": 1 }
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for generated_media
CREATE INDEX idx_generated_media_user_id ON generated_media(user_id);
CREATE INDEX idx_generated_media_type ON generated_media(media_type);
CREATE INDEX idx_generated_media_api_version ON generated_media(api_version);
CREATE INDEX idx_generated_media_created_at ON generated_media(created_at DESC);
CREATE INDEX idx_generated_media_user_type ON generated_media(user_id, media_type);
CREATE INDEX idx_generated_media_model ON generated_media(model);

-- Enable RLS
ALTER TABLE generated_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_media
CREATE POLICY generated_media_select_policy ON generated_media
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY generated_media_insert_policy ON generated_media
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY generated_media_update_policy ON generated_media
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY generated_media_delete_policy ON generated_media
    FOR DELETE USING (auth.uid() = user_id);

-- Service role bypass
CREATE POLICY generated_media_service_role_all ON generated_media
    FOR ALL USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE generated_media IS 'All user-generated media (images, videos, music, audio) with GCS URLs';
COMMENT ON COLUMN generated_media.media_type IS 'Type: image, video, music, audio';
COMMENT ON COLUMN generated_media.url IS 'Public HTTPS URL from GCS (required, no base64)';
COMMENT ON COLUMN generated_media.gcs_uri IS 'GCS URI format gs://bucket/path for internal operations';
COMMENT ON COLUMN generated_media.model IS 'AI model: imagen-4.0, veo-3.1, lyria-002, gemini-2.5-flash, etc.';
COMMENT ON COLUMN generated_media.metadata IS 'Type-specific metadata (duration, resolution, voice, etc.)';
COMMENT ON COLUMN generated_media.api_version IS 'API version: v1 (Vertex AI) or v2 (Gemini API)';

-- ============================================
-- TABLE 4: CONTEXT_PROMPTS
-- Stores AI-generated conversation summaries for context memory
-- Used by ContextPromptService to enhance future conversations
-- ============================================

DROP TABLE IF EXISTS context_prompts CASCADE;
CREATE TABLE context_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Summary generated by AI (1 paragraph)
    summary TEXT NOT NULL,
    
    -- Source tracking
    source_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    source_message_count INTEGER DEFAULT 0,
    
    -- Generation metadata
    model_used TEXT,  -- Model that generated the summary (e.g., gemini-2.5-flash)
    token_count INTEGER,
    
    -- Active/inactive for context injection
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ  -- Optional expiry for old context
);

-- Indexes for context_prompts
CREATE INDEX idx_context_prompts_user_id ON context_prompts(user_id);
CREATE INDEX idx_context_prompts_active ON context_prompts(user_id, is_active);
CREATE INDEX idx_context_prompts_created_at ON context_prompts(created_at DESC);
CREATE INDEX idx_context_prompts_source ON context_prompts(source_conversation_id);

-- Enable RLS
ALTER TABLE context_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for context_prompts
CREATE POLICY context_prompts_select_policy ON context_prompts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY context_prompts_insert_policy ON context_prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY context_prompts_update_policy ON context_prompts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY context_prompts_delete_policy ON context_prompts
    FOR DELETE USING (auth.uid() = user_id);

-- Service role bypass
CREATE POLICY context_prompts_service_role_all ON context_prompts
    FOR ALL USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE context_prompts IS 'AI-generated summaries for context memory in future conversations';
COMMENT ON COLUMN context_prompts.summary IS 'AI-generated 1-paragraph summary of past conversation';
COMMENT ON COLUMN context_prompts.is_active IS 'Whether to include this context in future prompts';
COMMENT ON COLUMN context_prompts.expires_at IS 'Optional expiry date for auto-cleanup';

-- ============================================
-- TRIGGERS: Auto-update timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for conversations
DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
CREATE TRIGGER trigger_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for generated_media
DROP TRIGGER IF EXISTS trigger_generated_media_updated_at ON generated_media;
CREATE TRIGGER trigger_generated_media_updated_at
    BEFORE UPDATE ON generated_media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for context_prompts
DROP TRIGGER IF EXISTS trigger_context_prompts_updated_at ON context_prompts;
CREATE TRIGGER trigger_context_prompts_updated_at
    BEFORE UPDATE ON context_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- UTILITY VIEWS (Optional - for easy querying)
-- ============================================

-- View: User media statistics
CREATE OR REPLACE VIEW user_media_stats AS
SELECT 
    user_id,
    media_type,
    COUNT(*) as total_count,
    SUM(file_size) as total_size_bytes,
    MAX(created_at) as last_created
FROM generated_media
GROUP BY user_id, media_type;

-- View: Recent conversations with message count
CREATE OR REPLACE VIEW recent_conversations AS
SELECT 
    c.id,
    c.user_id,
    c.title,
    c.model,
    c.api_version,
    c.created_at,
    c.updated_at,
    COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id
ORDER BY c.updated_at DESC;

-- ============================================
-- SAMPLE QUERIES (for reference)
-- ============================================

-- Get all images for a user
-- SELECT * FROM generated_media 
-- WHERE user_id = 'user-uuid' AND media_type = 'image' 
-- ORDER BY created_at DESC;

-- Get all media by model
-- SELECT * FROM generated_media 
-- WHERE model LIKE 'veo%' 
-- ORDER BY created_at DESC;

-- Get conversation with messages
-- SELECT c.*, m.role, m.content, m.created_at as msg_time
-- FROM conversations c
-- JOIN messages m ON c.id = m.conversation_id
-- WHERE c.id = 'conversation-uuid'
-- ORDER BY m.created_at ASC;

-- Get active context prompts for a user
-- SELECT * FROM context_prompts
-- WHERE user_id = 'user-uuid' AND is_active = true
-- ORDER BY created_at DESC;

-- Get storage stats per user
-- SELECT * FROM user_media_stats WHERE user_id = 'user-uuid';

-- ============================================
-- VERIFICATION (Run after setup)
-- ============================================

-- Check tables created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
-- ORDER BY table_name;

-- Check RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Count records
-- SELECT 'conversations' as table_name, COUNT(*) FROM conversations
-- UNION ALL SELECT 'messages', COUNT(*) FROM messages
-- UNION ALL SELECT 'generated_media', COUNT(*) FROM generated_media
-- UNION ALL SELECT 'context_prompts', COUNT(*) FROM context_prompts;
