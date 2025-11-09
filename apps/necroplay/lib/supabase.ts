import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xbbucipuftdncjzcluuk.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiYnVjaXB1ZnRkbmNqemNsdXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODUyNDMsImV4cCI6MjA3ODE2MTI0M30.NdfkEKbCOOdVuYWB400tszsxsai26wAIw19_EFWzvfM";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing. Please check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

