-- ACA BACKOFFICE SCHEMA
-- Run this in your Supabase SQL Editor

-- 1. Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    model TEXT NOT NULL DEFAULT 'gemini-3-flash-preview',
    instructions TEXT NOT NULL,
    temperature FLOAT DEFAULT 0.7,
    tools JSONB DEFAULT '[]',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    schedule TEXT, -- Cron expression or simple string
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Workflow Steps Table
CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id),
    step_order INTEGER NOT NULL,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Executions Table
CREATE TABLE IF NOT EXISTS executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflows(id),
    status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    triggered_by TEXT, -- user_id or 'system'
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Execution Steps Table (Logs)
CREATE TABLE IF NOT EXISTS execution_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES executions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES workflow_steps(id),
    agent_id UUID REFERENCES agents(id),
    input TEXT,
    output TEXT,
    status TEXT,
    error TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Content Table
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    body TEXT,
    status TEXT DEFAULT 'draft', -- draft, generated, edited, approved, rejected, published
    execution_id UUID REFERENCES executions(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Optional, but recommended)
-- For this demo, we assume public access or handled via service role
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy for public access (for demo purposes)
CREATE POLICY "Public Access" ON agents FOR ALL USING (true);
CREATE POLICY "Public Access" ON workflows FOR ALL USING (true);
CREATE POLICY "Public Access" ON workflow_steps FOR ALL USING (true);
CREATE POLICY "Public Access" ON executions FOR ALL USING (true);
CREATE POLICY "Public Access" ON execution_steps FOR ALL USING (true);
CREATE POLICY "Public Access" ON content FOR ALL USING (true);
CREATE POLICY "Public Access" ON audit_logs FOR ALL USING (true);

-- 8. Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active', -- active, unsubscribed
    source TEXT, -- landing, article, etc.
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON subscribers FOR ALL USING (true);
