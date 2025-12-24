-- ============================================
-- FRONTEND INTEGRATION API - DATABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Subscriptions Table
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan VARCHAR(20) NOT NULL DEFAULT 'free',
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, cancelled, expired
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  midtrans_subscription_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- 2. Payment Orders Table (for Midtrans)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(20) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, failed, expired
  midtrans_transaction_id VARCHAR(100),
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON payment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);

-- ============================================
-- 3. Payment History Table
-- ============================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) NOT NULL,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_order_id ON payment_history(order_id);

-- ============================================
-- 4. User API Keys Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  prefix VARCHAR(20) NOT NULL,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);

-- ============================================
-- 5. Shared Chats Table
-- ============================================
CREATE TABLE IF NOT EXISTS shared_chats (
  id VARCHAR(20) PRIMARY KEY,
  conversation_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_chats_user_id ON shared_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_chats_expires_at ON shared_chats(expires_at);

-- ============================================
-- 6. Conversations Table (for sharing feature)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- ============================================
-- 7. Prompts Table
-- ============================================
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  category VARCHAR(50),
  is_public BOOLEAN DEFAULT false,
  uses_count INTEGER DEFAULT 0,
  rating_sum DECIMAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_uses_count ON prompts(uses_count DESC);

-- ============================================
-- 8. Prompt Saves (Bookmarks) Table
-- ============================================
CREATE TABLE IF NOT EXISTS prompt_saves (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, prompt_id)
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_saves ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Users can read their own
CREATE POLICY "Users can read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Payment Orders: Users can read their own
CREATE POLICY "Users can read own orders" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);

-- Payment History: Users can read their own
CREATE POLICY "Users can read own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- API Keys: Users can manage their own
CREATE POLICY "Users can manage own api keys" ON user_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Shared Chats: Users can manage their own, anyone can read (for public shares)
CREATE POLICY "Users can manage own shares" ON shared_chats
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Anyone can read shares" ON shared_chats
  FOR SELECT USING (true);

-- Conversations: Users can manage their own
CREATE POLICY "Users can manage own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

-- Prompts: Users can manage their own, anyone can read public
CREATE POLICY "Users can manage own prompts" ON prompts
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Anyone can read public prompts" ON prompts
  FOR SELECT USING (is_public = true);

-- Prompt Saves: Users can manage their own
CREATE POLICY "Users can manage own saves" ON prompt_saves
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Grant access to service role (for backend)
-- ============================================
GRANT ALL ON subscriptions TO service_role;
GRANT ALL ON payment_orders TO service_role;
GRANT ALL ON payment_history TO service_role;
GRANT ALL ON user_api_keys TO service_role;
GRANT ALL ON shared_chats TO service_role;
GRANT ALL ON conversations TO service_role;
GRANT ALL ON prompts TO service_role;
GRANT ALL ON prompt_saves TO service_role;
