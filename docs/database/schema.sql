-- Vertex AI Chat Database Schema for Supabase
-- Run this in

 your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);

-- Row Level Security (RLS) policies
-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
-- Users can only see their own conversations
CREATE POLICY conversations_select_policy ON conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own conversations
CREATE POLICY conversations_insert_policy ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY conversations_update_policy ON conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY conversations_delete_policy ON conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Messages policies
-- Users can only see messages from their conversations
CREATE POLICY messages_select_policy ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Users can insert messages to their conversations
CREATE POLICY messages_insert_policy ON messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Users can update messages from their conversations
CREATE POLICY messages_update_policy ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Users can delete messages from their conversations
CREATE POLICY messages_delete_policy ON messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on conversations
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE conversations IS 'Stores chat conversations between users and AI models';
COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
COMMENT ON COLUMN conversations.model IS 'The Gemini model used for this conversation (e.g., gemini-2.5-flash)';
COMMENT ON COLUMN messages.role IS 'Either user or model, indicating who sent the message';
COMMENT ON COLUMN messages.metadata IS 'Additional metadata like finish_reason, usage_metadata, etc.';
