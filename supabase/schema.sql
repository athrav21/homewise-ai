-- ==============================================================================
-- HomeWise AI — Supabase Database Schema
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. User Preferences Table
-- Stores user's selected 11-factor priorities and budget ceiling
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    budget_min NUMERIC(6, 2) DEFAULT 1.00,
    budget_max NUMERIC(6, 2) DEFAULT 3.50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
    ON public.user_preferences FOR DELETE
    USING (auth.uid() = user_id);


-- ------------------------------------------------------------------------------
-- 3. Recommendation Feedback Table
-- Stores user like/dislike reactions for localities with scores and weights
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    locality_id TEXT NOT NULL,
    locality_name TEXT NOT NULL,
    recommendation_score INTEGER NOT NULL,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    feedback TEXT NOT NULL CHECK (feedback IN ('like', 'dislike')),
    budget_max NUMERIC(6, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recommendation_feedback
CREATE POLICY "Users can view their own feedback"
    ON public.recommendation_feedback FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Authenticated or anonymous users can insert feedback"
    ON public.recommendation_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own feedback"
    ON public.recommendation_feedback FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
    ON public.recommendation_feedback FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user_id ON public.recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_locality ON public.recommendation_feedback(locality_id);
