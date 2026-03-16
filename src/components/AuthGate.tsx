import { type ReactNode } from 'react';
import { useConvexAuth } from 'convex/react';
import { SignIn } from '@clerk/react';
import { Leaf, Loader } from 'lucide-react';

export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();

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
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--cream)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 24,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 52,
            height: 52,
            background: 'var(--forest)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <Leaf size={26} color="#fff" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            color: 'var(--forest)',
            fontWeight: 700,
            margin: 0,
          }}>Nourish</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 6 }}>
            Track your nutrition journey
          </p>
        </div>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#2d5a3d',
              colorBackground: '#ffffff',
              borderRadius: '12px',
              fontFamily: 'var(--font-body)',
            },
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
