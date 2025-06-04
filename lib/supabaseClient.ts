import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mivqzcaurydbjxqmzbwp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pdnF6Y2F1cnlkYmp4cW16YndwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMyMDE4NSwiZXhwIjoyMDYyODk2MTg1fQ.2mKXY7O0PGivizhvYsGwP56T0eRtagQXnkqCltdDbmI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
