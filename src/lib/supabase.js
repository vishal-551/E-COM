import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const getPublicUrl = (bucket, path) => supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

export const uploadImage = async ({ bucket, file, folder = '' }) => {
  const ext = file.name.split('.').pop();
  const filePath = `${folder ? `${folder}/` : ''}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: false });
  if (error) throw error;
  return { path: filePath, url: getPublicUrl(bucket, filePath) };
};

export const deleteImage = async ({ bucket, path }) => {
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
};
