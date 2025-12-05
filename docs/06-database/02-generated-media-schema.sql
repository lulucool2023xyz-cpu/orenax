-- Generated Media Schema v2
-- Complete schema for tracking all user-generated media with GCS URLs
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- GENERATED MEDIA TABLE
-- ============================================
-- Drop existing table if you want to recreate (BE CAREFUL - DATA LOSS)
-- DROP TABLE IF EXISTS generated_media CASCADE;

CREATE TABLE IF NOT EXISTS generated_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Media type: image, video, music, audio (tts)
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'music', 'audio')),
    
    -- GCS URLs
    url TEXT NOT NULL,           -- Public HTTPS URL (https://storage.googleapis.com/...)
    gcs_uri TEXT NOT NULL,       -- GCS URI (gs://bucket/path/file)
    
    -- File info
    filename TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,            -- Size in bytes
    
    -- Generation info
    model TEXT,                  -- Model used (imagen-4.0, veo-3.1, lyria-002, etc.)
    prompt TEXT,                 -- Original prompt
    negative_prompt TEXT,        -- Negative prompt if used
    
    -- Media-specific metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    -- For images: aspectRatio, resolution, seed
    -- For videos: duration, resolution, aspectRatio, hasAudio
    -- For music: duration (32.8s), sampleRate (48kHz)
    -- For audio: voiceName, duration, speakerCount
    
    -- API version used
    api_version TEXT DEFAULT 'v1',  -- v1 or v2
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_generated_media_user_id ON generated_media(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_media_type ON generated_media(media_type);
CREATE INDEX IF NOT EXISTS idx_generated_media_model ON generated_media(model);
CREATE INDEX IF NOT EXISTS idx_generated_media_created_at ON generated_media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_media_user_type ON generated_media(user_id, media_type);
CREATE INDEX IF NOT EXISTS idx_generated_media_api_version ON generated_media(api_version);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE generated_media ENABLE ROW LEVEL SECURITY;

-- Users can only see their own media
CREATE POLICY generated_media_select_policy ON generated_media
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own media
CREATE POLICY generated_media_insert_policy ON generated_media
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own media (metadata only)
CREATE POLICY generated_media_update_policy ON generated_media
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own media
CREATE POLICY generated_media_delete_policy ON generated_media
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- SERVICE ROLE ACCESS (for backend)
-- ============================================
-- Backend uses service role which bypasses RLS

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_generated_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generated_media_updated_at ON generated_media;
CREATE TRIGGER trigger_generated_media_updated_at
    BEFORE UPDATE ON generated_media
    FOR EACH ROW
    EXECUTE FUNCTION update_generated_media_updated_at();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE generated_media IS 'Stores all user-generated media (images, videos, music, audio) with GCS URLs';
COMMENT ON COLUMN generated_media.media_type IS 'Type: image, video, music, audio';
COMMENT ON COLUMN generated_media.url IS 'Public HTTPS URL for direct access';
COMMENT ON COLUMN generated_media.gcs_uri IS 'GCS URI for internal operations (gs://bucket/path)';
COMMENT ON COLUMN generated_media.model IS 'AI model used: imagen-4.0, veo-3.1, lyria-002, gemini-2.5-flash-image, etc.';
COMMENT ON COLUMN generated_media.metadata IS 'Type-specific metadata (duration, resolution, voice, etc.)';
COMMENT ON COLUMN generated_media.api_version IS 'API version used: v1 (Vertex AI) or v2 (Gemini API)';

-- ============================================
-- SAMPLE QUERIES
-- ============================================

-- Get all images for a user
-- SELECT * FROM generated_media 
-- WHERE user_id = 'user-uuid' AND media_type = 'image' 
-- ORDER BY created_at DESC;

-- Get all media by model
-- SELECT * FROM generated_media 
-- WHERE model LIKE 'veo%' 
-- ORDER BY created_at DESC;

-- Get storage stats per user
-- SELECT 
--     user_id,
--     media_type,
--     COUNT(*) as count,
--     SUM(file_size) as total_size
-- FROM generated_media 
-- GROUP BY user_id, media_type;

-- ============================================
-- METADATA EXAMPLES
-- ============================================

-- Image metadata example:
-- {
--   "aspectRatio": "16:9",
--   "resolution": "1024x1024", 
--   "seed": 12345,
--   "negativePrompt": "blurry, low quality"
-- }

-- Video metadata example:
-- {
--   "duration": 8,
--   "resolution": "1080p",
--   "aspectRatio": "16:9",
--   "hasAudio": true,
--   "operationId": "operations/xxx"
-- }

-- Music metadata example:
-- {
--   "duration": 32.8,
--   "sampleRate": 48000,
--   "format": "wav",
--   "seed": 12345
-- }

-- Audio/TTS metadata example:
-- {
--   "duration": 5.2,
--   "voiceName": "Kore",
--   "speakerCount": 1,
--   "sampleRate": 24000
-- }
