import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log("🔍 URL cargada:", supabaseUrl ? "Sí, detectada" : "Falta URL");
console.log("🔑 Llave cargada:", supabaseAnonKey ? "Sí, detectada" : "Falta Llave");
console.log("✅ Cliente Supabase listo:", supabase);