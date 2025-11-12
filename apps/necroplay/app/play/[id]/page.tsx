// Static export için generateStaticParams - build zamanında çalışır
// Supabase'den tüm file ID'lerini çeker
export async function generateStaticParams() {
  try {
    // Build zamanında Supabase'den tüm file ID'lerini çek
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xbbucipuftdncjzcluuk.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiYnVjaXB1ZnRkbmNqemNsdXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1ODUyNDMsImV4cCI6MjA3ODE2MTI0M30.NdfkEKbCOOdVuYWB400tszsxsai26wAIw19_EFWzvfM";
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials missing, returning empty array for generateStaticParams");
      return [];
    }

    const { createClient } = await import("@supabase/supabase-js");
    const buildSupabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await buildSupabase
      .from("files")
      .select("id")
      .limit(1000); // Maksimum 1000 dosya (Next.js limit)

    if (error) {
      console.warn("Error fetching file IDs for generateStaticParams:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Next.js format: [{ id: '...' }, { id: '...' }]
    return data.map((file) => ({
      id: file.id,
    }));
  } catch (error) {
    console.warn("Error in generateStaticParams:", error);
    // Hata durumunda boş array döndür, client-side routing ile çalışmaya devam eder
    return [];
  }
}

// Server component - client component'i import eder
import PlayPageClient from "./PlayPageClient";

export default function PlayPage() {
  return <PlayPageClient />;
}
