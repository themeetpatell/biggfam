-- Add clerk_id to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Add completed flag to bulletin_posts (for task-type posts)
ALTER TABLE bulletin_posts ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT false;

-- Invite tokens table (for family member invite flow)
CREATE TABLE IF NOT EXISTS invite_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by  UUID REFERENCES users(id),
  token       VARCHAR(64) UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);

-- Add preferred_currency to families (INR default)
ALTER TABLE families ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) NOT NULL DEFAULT 'INR';

-- Index for bulletin pinned posts (dashboard performance)
CREATE INDEX IF NOT EXISTS idx_bulletin_pinned ON bulletin_posts(family_id, pinned);
