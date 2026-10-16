import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Icon, { CrownMark, WeaveBand } from '../../components/ui/Icon';

const ModernAuth = () => {
  const [role, setRole] = useState('learner');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    throneName: '',
    title: '',
    country: '',
    community: '',
    phone: '',
    linkedThroneName: '',
    delegateRole: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/app/dashboard');
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
      console.error('Login error:', error);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { password, confirmPassword, ...profile } = formData;
      const userData = {
        ...profile,
        role,
        displayName: formData.fullName || formData.throneName
      };
      await signup(formData.email, formData.password, userData);
      navigate('/app/dashboard');
    } catch (error) {
      setError('Failed to create account. Please try again.');
      console.error('Registration error:', error);
    }
    setLoading(false);
  };

  const field = (name, label, type = 'text', placeholder = '', required = true, extra = null) => (
    <div key={name}>
      <label className="a-label" htmlFor={name}>{label}</label>
      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleInputChange}
        required={required}
        className="a-input"
      />
      {extra}
    </div>
  );

  const renderRoleFields = () => {
    switch (role) {
      case 'learner':
        return (
          <>
            {field('fullName', 'Full name')}
            {field('email', 'Email', 'email')}
            {field('phone', 'Phone', 'tel', '', false)}
            {field('country', 'Country / Community')}
          </>
        );
      case 'ruler':
      case 'chief':
      case 'elder':
        return (
          <>
            {field('throneName', 'Throne name', 'text', 'e.g., Ife Kingdom')}
            {field('fullName', 'Full name')}
            {field('title', 'Title', 'text', 'Oba, Eze, Emir…')}
            {field('country', 'Country / Community')}
            {field('email', 'Email', 'email')}
          </>
        );
      case 'delegate':
        return (
          <>
            {field('fullName', 'Full name')}
            {field('linkedThroneName', 'Linked throne', 'text', 'The throne you serve')}
            {field('delegateRole', 'Your role', 'text', 'Secretary, Media Aide…')}
            {field('email', 'Email', 'email')}
          </>
        );
      default:
        return null;
    }
  };

  const valueProps = [
    { icon: 'shield', text: 'A dashboard shaped to your role' },
    { icon: 'language', text: 'Interface and books in your language' },
    { icon: 'meetings', text: 'Live and recorded council meetings' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* ===== Left brand panel ===== */}
      <div className="hidden lg:flex w-[44%] flex-col justify-between text-white" style={{ background: '#0F1A44' }}>
        <div className="px-14 pt-11">
          <Link to="/" className="inline-flex items-center gap-3">
            <CrownMark size={40} variant="gold" />
            <span className="font-display font-bold text-[26px]">ATRC</span>
          </Link>
          <h1 className="font-display font-bold text-[46px] leading-[1.12] mt-24 max-w-[460px]">
            The council's digital home
          </h1>
          <p className="mt-[18px] text-[19px] leading-[1.5] text-[#C9D0EE] max-w-[440px]">
            Sign in to your dashboard to file reports, join meetings, read in your own language and keep learning.
          </p>
          <ul className="mt-9 space-y-4 text-[17px]">
            {valueProps.map((v) => (
              <li key={v.text} className="flex items-center gap-3">
                <Icon name={v.icon} size={22} className="text-[#E3B04B] flex-shrink-0" />
                {v.text}
              </li>
            ))}
          </ul>
        </div>
        <WeaveBand height={16} />
      </div>

      {/* ===== Right form ===== */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <CrownMark size={40} variant="dark" />
            <div className="leading-tight">
              <div className="font-bold text-[17px]" style={{ color: 'var(--ink)' }}>ATRC</div>
              <div className="text-[13px]" style={{ color: 'var(--muted)' }}>Traditional Rulers</div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="flex rounded-[12px] p-1 mb-8 border"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}
          >
            {[
              { id: true, label: 'Sign in' },
              { id: false, label: 'Join the council' },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => { setIsLogin(tab.id); setError(''); }}
                className="flex-1 py-2.5 px-4 rounded-[9px] text-[16px] font-semibold transition-colors min-h-[46px]"
                style={
                  isLogin === tab.id
                    ? { background: 'var(--surface)', color: 'var(--ink)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                    : { color: 'var(--muted)' }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <h2 className="font-display font-bold text-[32px]" style={{ color: 'var(--brand)' }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1.5 mb-7 text-[15px]" style={{ color: 'var(--muted)' }}>
            {isLogin
              ? 'Sign in with the email you registered with.'
              : 'Tell us who you are and which community you serve.'}
          </p>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-[10px] text-[14px] font-medium"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger-fg)' }}
            >
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {field('email', 'Email', 'email')}
              {field('password', 'Password', 'password')}
              <button
                type="submit"
                disabled={loading}
                className="a-btn-primary w-full !min-h-[52px] !rounded-[12px] !text-[17px] !font-bold disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <p className="text-[14px] text-center pt-1" style={{ color: 'var(--muted)' }}>
                Forgot your password?{' '}
                <button type="button" className="font-semibold hover:underline" style={{ color: 'var(--brand)' }}>
                  Reset here
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="a-label" htmlFor="role">I am joining as</label>
                <div className="relative">
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="a-input appearance-none pr-10"
                  >
                    <option value="learner">Learner</option>
                    <option value="ruler">Ruler</option>
                    <option value="chief">Chief</option>
                    <option value="elder">Elder</option>
                    <option value="delegate">Delegate</option>
                  </select>
                  <Icon
                    name="chevronDown"
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--muted)' }}
                  />
                </div>
              </div>

              {renderRoleFields()}

              {field('password', 'Password', 'password')}
              {field('confirmPassword', 'Confirm password', 'password')}

              <button
                type="submit"
                disabled={loading}
                className="a-btn-primary w-full !min-h-[52px] !rounded-[12px] !text-[17px] !font-bold disabled:opacity-60"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-[14px]" style={{ color: 'var(--muted)' }}>
            <Link to="/" className="hover:underline" style={{ color: 'var(--brand)' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernAuth;
