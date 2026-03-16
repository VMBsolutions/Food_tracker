import { useState, type ReactNode } from 'react';
import { useConvexAuth } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Leaf, Loader } from 'lucide-react';

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cream)',
      }}>
        <Loader size={28} color="var(--sage)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

function LoginScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (flow === 'signUp' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signIn('password', { email, password, flow });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg.includes('Invalid') || msg.includes('password')
        ? 'Incorrect email or password'
        : msg.includes('exists') || msg.includes('already')
          ? 'An account with this email already exists'
          : msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid var(--border-strong)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    background: 'var(--bg-card)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px 36px',
        boxShadow: '0 8px 40px rgba(26,58,42,0.10)',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52,
            height: 52,
            background: 'var(--forest)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Leaf size={26} color="#fff" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            color: 'var(--forest)',
            fontWeight: 700,
            margin: 0,
          }}>
            Nourish
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 6 }}>
            {flow === 'signIn' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--cream)',
          borderRadius: 'var(--radius-md)',
          padding: 4,
          marginBottom: 28,
        }}>
          {(['signIn', 'signUp'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFlow(f); setError(''); }}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                background: flow === f ? 'var(--bg-card)' : 'transparent',
                color: flow === f ? 'var(--forest)' : 'var(--text-muted)',
                boxShadow: flow === f ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)',
              }}
            >
              {f === 'signIn' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
          />
          {flow === 'signUp' && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--sage)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            />
          )}

          {error && (
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--terracotta)',
              background: 'rgba(196,112,75,0.08)',
              border: '1px solid rgba(196,112,75,0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              margin: 0,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: 4, opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? 'Please wait…'
              : flow === 'signIn' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 24 }}>
          Track your nutrition journey with Nourish
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
