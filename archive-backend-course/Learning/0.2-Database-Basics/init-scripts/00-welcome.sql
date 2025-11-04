-- Welcome to Database Learning with Docker!
-- This script runs automatically when the database is first created

-- Create a welcome table
CREATE TABLE IF NOT EXISTS welcome (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert welcome message
INSERT INTO welcome (message) VALUES 
('🎉 Welcome to Database Learning!'),
('🐳 Your Docker PostgreSQL setup is complete!'),
('📚 Start with exercises/01-basic-crud.sql'),
('💡 Use pgAdmin at http://localhost:8080');

-- Create a function to show welcome message
CREATE OR REPLACE FUNCTION show_welcome() 
RETURNS TABLE(message TEXT) AS $$
BEGIN
  RETURN QUERY SELECT w.message FROM welcome w ORDER BY w.id;
END;
$$ LANGUAGE plpgsql;

-- Display welcome message
SELECT '🎓 Database Learning Environment Ready!' as status;
SELECT '📖 Run: SELECT * FROM show_welcome(); to see welcome messages' as tip;
