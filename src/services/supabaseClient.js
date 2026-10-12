import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project-id')
);

// Fallback in-memory/localStorage session store when Supabase env vars are not yet configured
const LOCAL_AUTH_STORAGE_KEY = 'homewise_local_auth_user';

function getLocalUser() {
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setLocalUser(user) {
  try {
    if (user) {
      localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
    }
  } catch (e) {
    // ignore
  }
}

// Initialize official Supabase client if credentials exist
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * Sign up a new user with email and password
 */
export async function signUpUser({ email, password }) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    return data.user;
  }

  // Graceful local mock signup when Supabase credentials are missing
  const mockUser = {
    id: 'local-user-' + Math.random().toString(36).substring(2, 9),
    email,
    created_at: new Date().toISOString(),
    user_metadata: { isDemo: true }
  };
  setLocalUser(mockUser);
  return mockUser;
}

/**
 * Sign in existing user with email and password
 */
export async function signInUser({ email, password }) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data.user;
  }

  // Graceful local mock signin when Supabase credentials are missing
  const existing = getLocalUser();
  const user = existing && existing.email === email
    ? existing
    : {
        id: 'local-user-' + Math.random().toString(36).substring(2, 9),
        email,
        created_at: new Date().toISOString(),
        user_metadata: { isDemo: true }
      };
  setLocalUser(user);
  return user;
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  }
  setLocalUser(null);
  return true;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  if (isSupabaseConfigured && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  }
  return getLocalUser();
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback) {
  if (isSupabaseConfigured && supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }

  // Initial call with local user
  callback(getLocalUser());
  return () => {};
}
