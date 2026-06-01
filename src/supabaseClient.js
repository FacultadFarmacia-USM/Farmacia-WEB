import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Cliente normal para todos los usuarios (El que ya tienes)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// NUEVO: Cliente con poderes de Administrador (Solo para crear usuarios)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false // Evita que cierre la sesión del Super Admin
  }
});