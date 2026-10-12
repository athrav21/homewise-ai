import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_FEEDBACK_KEY = 'homewise_recommendation_feedback';

function getLocalFeedbackStore() {
  try {
    const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function setLocalFeedbackStore(store) {
  try {
    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(store));
  } catch (e) {
    // ignore
  }
}

/**
 * Submit user feedback ('like' or 'dislike') for a locality recommendation
 */
export async function submitFeedback({
  userId,
  localityId,
  localityName,
  matchScore,
  preferences,
  feedback,
  budgetMax
}) {
  const timestamp = new Date().toISOString();
  const feedbackRecord = {
    user_id: userId && !userId.startsWith('local-user-') ? userId : null,
    locality_id: String(localityId),
    locality_name: localityName,
    recommendation_score: Math.round(Number(matchScore) || 0),
    preferences: preferences || {},
    feedback: feedback, // 'like' | 'dislike'
    budget_max: Number(budgetMax) || null,
    created_at: timestamp
  };

  // Cache locally
  const localStore = getLocalFeedbackStore();
  localStore[String(localityId)] = {
    feedback,
    timestamp,
    localityName
  };
  setLocalFeedbackStore(localStore);

  // Send to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('recommendation_feedback')
        .insert([feedbackRecord])
        .select()
        .single();

      if (error) {
        console.warn('Supabase feedback insert error:', error.message);
        return { success: false, source: 'local', error: error.message };
      }
      return { success: true, source: 'supabase', data };
    } catch (err) {
      console.warn('Supabase feedback error:', err);
      return { success: false, source: 'local', error: err.message };
    }
  }

  return { success: true, source: 'local', data: feedbackRecord };
}

/**
 * Get the feedback state for a locality ('like' | 'dislike' | null)
 */
export function getLocalityFeedback(localityId) {
  const localStore = getLocalFeedbackStore();
  return localStore[String(localityId)]?.feedback || null;
}
