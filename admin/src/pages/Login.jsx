import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, LayoutGrid, Users, Briefcase, FileText, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split">
      <div className="login-panel-left">
        <div className="login-pattern" aria-hidden="true" />
        <div className="login-glow" aria-hidden="true" />

        <div className="login-left-content">
          <span className="login-eyebrow">Admin Portal</span>
          <h1 className="login-headline">
            Manage. Monitor.
            <br />
            <span className="login-gold-text">Grow.</span>
          </h1>
          <p className="login-tagline">
            One dashboard for leads, invoices, and revenue —
            built for the CrazyGrowMind Studio team.
          </p>

          <div className="preview-stage" aria-hidden="true">
            <div className="preview-card">
              <div className="preview-rail">
                <span className="preview-rail-icon active"><LayoutGrid size={14} /></span>
                <span className="preview-rail-icon"><Users size={14} /></span>
                <span className="preview-rail-icon"><Briefcase size={14} /></span>
                <span className="preview-rail-icon"><FileText size={14} /></span>
                <span className="preview-rail-icon"><TrendingUp size={14} /></span>
                <span className="preview-rail-icon"><Settings size={14} /></span>
              </div>
              <div className="preview-body">
                <div className="preview-stats-row">
                  <div className="preview-stat">
                    <span className="preview-stat-label">Total Leads</span>
                    <span className="preview-stat-value">6</span>
                    <svg className="preview-sparkline" viewBox="0 0 80 24" preserveAspectRatio="none">
                      <polyline points="0,20 15,16 30,18 45,10 60,12 80,3" />
                    </svg>
                  </div>
                  <div className="preview-stat">
                    <span className="preview-stat-label">Revenue</span>
                    <span className="preview-stat-value">₹30,675</span>
                    <span className="preview-stat-delta">+18% this month</span>
                  </div>
                </div>
                <div className="preview-donut-card">
                  <span className="preview-stat-label">Leads by Status</span>
                  <div className="preview-donut-row">
                    <svg viewBox="0 0 42 42" className="preview-donut">
                      <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#5b8def" strokeWidth="6" strokeDasharray="25 75" />
                      <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#34d399" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="-25" />
                      <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#fb923c" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="-45" />
                      <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="var(--login-gold)" strokeWidth="6" strokeDasharray="20 80" strokeDashoffset="-65" />
                      <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#f87171" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="-85" />
                    </svg>
                    <ul className="preview-legend">
                      <li><span className="dot" style={{ background: '#5b8def' }} />Proposal Sent</li>
                      <li><span className="dot" style={{ background: '#34d399' }} />Qualified</li>
                      <li><span className="dot" style={{ background: '#fb923c' }} />Won</li>
                      <li><span className="dot" style={{ background: 'var(--login-gold)' }} />New</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-panel-right">
        <div className="login-panel-pattern" aria-hidden="true" />

        <div className="login-card">
          <img src={logo} alt="CrazyGrowMind Studio" className="login-card-logo" />
          <h2 className="login-card-title">Welcome back</h2>
          <p className="login-card-subtitle">Sign in to your admin account</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Email</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-field" style={{ marginTop: 16 }}>
              <label>Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-row">
              <label className="remember-me">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <Link to="/forgot-password" className="auth-link-inline">
                Forgot password?
              </Link>
            </div>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="secure-access-note">
            <ShieldCheck size={14} />
            Secured admin access
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
