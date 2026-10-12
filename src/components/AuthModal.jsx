import React, { useState } from 'react';
import { X, Lock, Mail, UserCheck, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { signInUser, signUpUser, isSupabaseConfigured } from '../services/supabaseClient';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const user = await signUpUser({ email, password });
        setSuccessMsg('Account created successfully! Preferences will now sync to your profile.');
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 1200);
      } else {
        const user = await signInUser({ email, password });
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 800);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card">
        {/* Header */}
        <div className="auth-modal-header">
          <div className="flex items-center gap-2">
            <div className="auth-modal-icon">
              <ShieldCheck size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="auth-modal-title">{isSignUp ? 'Create HomeWise Account' : 'Sign in to HomeWise AI'}</h3>
              <p className="auth-modal-sub">
                {isSignUp
                  ? 'Save your preferred Mumbai MMR priorities and recommendations.'
                  : 'Access your saved neighborhood priorities and feedback.'}
              </p>
            </div>
          </div>
          <button className="auth-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Configuration notice if Supabase env vars not yet populated */}
        {!isSupabaseConfigured && (
          <div className="auth-demo-badge">
            <AlertCircle size={15} className="text-amber shrink-0" />
            <span>
              <strong>Demo Auth Active:</strong> To connect live Supabase cloud auth, set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code>.
            </span>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="auth-alert error">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert success">
            <CheckCircle size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-modal-form">
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                required
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                type="password"
                required
                minLength={6}
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-lg w-full mt-2"
          >
            {loading ? (
              <span>Processing...</span>
            ) : isSignUp ? (
              <span>Create Account</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Toggle between Login and Signup */}
        <div className="auth-modal-footer">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="auth-toggle-link"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
              >
                Sign in here
              </button>
            </p>
          ) : (
            <p>
              New to HomeWise AI?{' '}
              <button
                type="button"
                className="auth-toggle-link"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
              >
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
