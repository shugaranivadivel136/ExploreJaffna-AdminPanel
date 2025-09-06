// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xggfxfxvsvqyojpcudbd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZ2Z4Znh2c3ZxeW9qcGN1ZGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NzQzODAsImV4cCI6MjA2ODE1MDM4MH0.S63BslSC9fw9wPjlfSc-TuGLx5aZfWRM6_RhTaEpCjQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
