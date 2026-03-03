import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    const isValidUrl = (url: string | undefined) => {
      if (!url) return false;
      try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    };

    if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing or invalid. Please set SUPABASE_URL (must be a valid https:// URL) and SUPABASE_ANON_KEY in the Secrets panel.");
    }
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey);
  }
  return supabaseClient;
};

// For backward compatibility or simple usage, but risky if called at top level
// Better to use getSupabase() everywhere
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  }
});

// Helper to log audit events
export const logAudit = async (action: string, tableName: string, recordId?: string, oldData?: any, newData?: any) => {
  try {
    const client = getSupabase();
    await client.from('audit_logs').insert({
      action,
      table_name: tableName,
      record_id: recordId,
      old_data: oldData,
      new_data: newData,
      user_id: 'admin' // In a real app, get from auth
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};
