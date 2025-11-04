-- Create rate_limits table for tracking API rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_ip TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for efficient querying by IP and timestamp
CREATE INDEX IF NOT EXISTS idx_rate_limits_client_ip_created_at 
ON rate_limits (client_ip, created_at);

-- Create index for efficient cleanup of old entries
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at 
ON rate_limits (created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to manage rate limits
CREATE POLICY "Service role can manage rate limits" ON rate_limits
FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow anon role to insert rate limits (for edge functions)
CREATE POLICY "Allow anon to insert rate limits" ON rate_limits
FOR INSERT WITH CHECK (true);

-- Create policy to allow anon role to select rate limits (for edge functions)
CREATE POLICY "Allow anon to select rate limits" ON rate_limits
FOR SELECT USING (true);

-- Create policy to allow anon role to delete old rate limits (for cleanup)
CREATE POLICY "Allow anon to delete old rate limits" ON rate_limits
FOR DELETE USING (true);