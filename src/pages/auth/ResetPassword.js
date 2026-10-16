import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { sendPasswordResetEmail, confirmPasswordReset } from '../../api/auth';
import { auth } from '../../api/config';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(searchParams.get('token') ? 'confirm' : 'request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [requested, setRequested] = useState(false);

  const requestToken = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setRequested(true);
      setStep('confirm');
      toast.success('If that email exists, a reset token was issued. Ask an administrator for it.');
    } catch (err) {
      toast.error(err.message || 'Request failed');
    } finally {
      setBusy(false);
    }
  };

  const confirmReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await confirmPasswordReset(auth, token.trim(), newPassword);
      toast.success('Password updated. You can sign in now.');
      navigate('/auth');
    } catch (err) {
      toast.error(err.message || 'Reset failed — the token may be expired');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="a-card w-full max-w-[420px] !p-8">
        <h1 className="font-display font-bold text-[28px] mb-2" style={{ color: 'var(--brand)' }}>
          Reset password
        </h1>
        <p className="text-[15px] mb-6" style={{ color: 'var(--muted)' }}>
          {step === 'request'
            ? 'Enter your account email. A reset token will be issued — an administrator can retrieve it for you.'
            : 'Enter the reset token an administrator gave you, then choose a new password.'}
        </p>

        {step === 'request' ? (
          <form onSubmit={requestToken} className="space-y-4">
            <div>
              <label className="a-label" htmlFor="rp-email">Email address</label>
              <input
                id="rp-email"
                type="email"
                required
                className="a-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" disabled={busy} className="a-btn-primary w-full disabled:opacity-60">
              {busy ? 'Requesting…' : 'Request reset token'}
            </button>
          </form>
        ) : (
          <form onSubmit={confirmReset} className="space-y-4">
            <div>
              <label className="a-label" htmlFor="rp-token">Reset token</label>
              <input
                id="rp-token"
                type="text"
                required
                className="a-input"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste the token from your administrator"
              />
            </div>
            <div>
              <label className="a-label" htmlFor="rp-new">New password</label>
              <input
                id="rp-new"
                type="password"
                required
                minLength={6}
                className="a-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="a-label" htmlFor="rp-confirm">Confirm new password</label>
              <input
                id="rp-confirm"
                type="password"
                required
                minLength={6}
                className="a-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={busy} className="a-btn-primary w-full disabled:opacity-60">
              {busy ? 'Updating…' : 'Set new password'}
            </button>
            {!requested && (
              <button
                type="button"
                onClick={() => setStep('request')}
                className="w-full text-center text-[14px] font-semibold"
                style={{ color: 'var(--brand)' }}
              >
                I don't have a token — request one
              </button>
            )}
          </form>
        )}

        <div className="mt-6 pt-4 text-center text-[14px]" style={{ borderTop: '1px solid var(--border)' }}>
          <Link to="/auth" className="font-semibold" style={{ color: 'var(--brand)' }}>
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
