-- Subscriptions table: track PayPal subscription status
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  paypal_subscription_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,            -- 'influencer' | 'studio_pro'
  billing_cycle TEXT NOT NULL,   -- 'monthly' | 'annual'
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED'
  credits_per_month INTEGER NOT NULL,
  current_period_start DATETIME,
  current_period_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(google_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_id ON subscriptions(paypal_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
