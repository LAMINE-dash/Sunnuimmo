import { useState, lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

// Lazy-load heavy pages
const ListingsPage  = lazy(() => import('./pages/ListingsPage'));
const PropertyPage  = lazy(() => import('./pages/PropertyPage'));
const PostPropertyPage = lazy(() => import('./pages/PostPropertyPage'));
const MessagesPage  = lazy(() => import('./pages/MessagesPage'));
const AgencyPage    = lazy(() => import('./pages/AgencyPage'));
const PricingPage   = lazy(() => import('./pages/PricingPage'));
const EstimatePage  = lazy(() => import('./pages/EstimatePage'));
const PaymentPage   = lazy(() => import('./pages/PaymentPage'));
const ProfilePage   = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const VisitsPage     = lazy(() => import('./pages/VisitsPage'));

type Page =
  | 'home' | 'listings' | 'property' | 'login' | 'register'
  | 'dashboard' | 'pricing' | 'estimate' | 'agencies' | 'messages'
  | 'post-property' | 'payment' | 'profile' | 'favorites' | 'visits';

interface PageState { page: Page; params?: Record<string, string> }

const NO_FOOTER: Page[] = ['login', 'register', 'dashboard', 'messages'];

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center pt-16">
    <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  const [{ page, params }, setPage] = useState<PageState>({ page: 'home' });

  const navigate = (newPage: string, newParams?: Record<string, string>) => {
    setPage({ page: newPage as Page, params: newParams });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Navbar currentPage={page} onNavigate={navigate} />

        <Suspense fallback={<PageLoader />}>
          {page === 'home'         && <HomePage onNavigate={navigate} />}
          {page === 'listings'     && <ListingsPage onNavigate={navigate} initialFilters={params} />}
          {page === 'property'     && params?.id && <PropertyPage propertyId={params.id} onNavigate={navigate} />}
          {page === 'login'        && <AuthPage mode="login" onNavigate={navigate} />}
          {page === 'register'     && <AuthPage mode="register" onNavigate={navigate} />}
          {page === 'dashboard'    && <DashboardPage onNavigate={navigate} />}
          {page === 'pricing'      && <PricingPage onNavigate={navigate} />}
          {page === 'estimate'     && <EstimatePage onNavigate={navigate} />}
          {page === 'post-property'&& <PostPropertyPage onNavigate={navigate} />}
          {page === 'messages'     && <MessagesPage onNavigate={navigate} initialPropertyId={params?.propertyId} initialReceiverId={params?.receiverId} />}
          {page === 'agencies'     && <AgencyPage onNavigate={navigate} />}
          {page === 'payment'      && <PaymentPage onNavigate={navigate} planId={params?.planId} />}
          {page === 'profile'      && <ProfilePage onNavigate={navigate} />}
          {page === 'favorites'     && <FavoritesPage onNavigate={navigate} />}
          {page === 'visits'        && <VisitsPage onNavigate={navigate} />}
        </Suspense>

        {!NO_FOOTER.includes(page) && <Footer onNavigate={navigate} />}
      </div>
    </AuthProvider>
  );
}

export default App;
