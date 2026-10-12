import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_PREF_KEY = 'homewise_saved_preferences';

/**
 * Save user preferences and budget range
 */
export async function savePreferences(userId, { preferences, budgetMin, budgetMax }) {
  const payload = {
    preferences,
    budget_min: Number(budgetMin),
    budget_max: Number(budgetMax),
    updated_at: new Date().toISOString()
  };

  // Always save locally as fallback / instant cache
  try {
    localStorage.setItem(LOCAL_PREF_KEY, JSON.stringify(payload));
  } catch (e) {
    // ignore
  }

  // If user is authenticated and Supabase is configured, upsert into DB
  if (isSupabaseConfigured && supabase && userId && !userId.startsWith('local-user-')) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: userId,
            ...payload
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) {
        console.warn('Supabase save preferences warning:', error.message);
        return { success: false, source: 'local', error: error.message };
      }
      return { success: true, source: 'supabase', data };
    } catch (err) {
      console.warn('Supabase save error:', err);
      return { success: false, source: 'local', error: err.message };
    }
  }

  return { success: true, source: 'local', data: payload };
}

/**
 * Load saved preferences for the user
 */
export async function loadPreferences(userId) {
  // If user is authenticated and Supabase is active, fetch from database
  if (isSupabaseConfigured && supabase && userId && !userId.startsWith('local-user-')) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences, budget_min, budget_max')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Supabase load preferences error:', error.message);
      } else if (data) {
        return {
          preferences: data.preferences || null,
          budgetMin: data.budget_min ? Number(data.budget_min) : null,
          budgetMax: data.budget_max ? Number(data.budget_max) : null,
          source: 'supabase'
        };
      }
    } catch (err) {
      console.warn('Supabase load error:', err);
    }
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(LOCAL_PREF_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        preferences: parsed.preferences || null,
        budgetMin: parsed.budget_min ? Number(parsed.budget_min) : null,
        budgetMax: parsed.budget_max ? Number(parsed.budget_max) : null,
        source: 'local'
      };
    }
  } catch (e) {
    // ignore
  }

  return null;
}
