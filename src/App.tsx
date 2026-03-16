import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, History, UtensilsCrossed, Leaf, Sparkles, LogOut } from 'lucide-react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Dashboard } from './pages/Dashboard';
import { History as HistoryPage } from './pages/History';
import { FoodDatabase } from './pages/FoodDatabase';
import { AiChat } from './pages/AiChat';
import { AuthGate } from './components/AuthGate';
import './styles/global.css';

function AppLayout() {
  const { signOut } = useAuthActions();

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Leaf size={22} color="#fff" />
          </div>
          <div>
            <h1>Nourish</h1>
            <span>Food Tracker</span>
          </div>
        </div>

        <div className="sidebar-section-label">Menu</div>

        <nav className="sidebar-nav">
          <NavLink to="/" end>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/history">
            <History size={20} />
            <span>History</span>
          </NavLink>
          <NavLink to="/foods">
            <UtensilsCrossed size={20} />
            <span>Food Database</span>
          </NavLink>
          <NavLink to="/ai-chat">
            <Sparkles size={20} />
            <span>AI Assistant</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={() => signOut()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              padding: '6px 0',
              width: '100%',
              fontFamily: 'var(--font-body)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/foods" element={<FoodDatabase />} />
          <Route path="/ai-chat" element={<AiChat />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <AppLayout />
      </AuthGate>
    </BrowserRouter>
  );
}

export default App;
