import { useState } from 'react';
import { Building2, Menu, X, ChevronDown, Bell, MessageSquare, User, LogOut, LayoutDashboard, Search, Star, Heart, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isHome = currentPage === 'home';

  const links = [
    { label: 'Annonces', page: 'listings' },
    { label: 'Estimation IA', page: 'estimate' },
    { label: 'Tarifs', page: 'pricing' },
    { label: 'Agences', page: 'agencies' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isHome ? 'bg-transparent' : 'bg-white shadow-sm border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-lg tracking-tight ${isHome ? 'text-white' : 'text-gray-900'}`}>
              Teranga<span className="text-amber-500">Immo</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <button key={l.page} onClick={() => onNavigate(l.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === l.page ? 'bg-amber-50 text-amber-700' :
                  isHome ? 'text-white/80 hover:text-white hover:bg-white/10' :
                  'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('listings')}
              className={`hidden md:flex p-2 rounded-lg transition-colors ${isHome ? 'text-white/80 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Search className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center gap-1">
                <button onClick={() => onNavigate('messages')}
                  className={`p-2 rounded-lg transition-colors ${isHome ? 'text-white/80 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <MessageSquare className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                    <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-24 truncate">
                      {profile?.full_name || 'Compte'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <button onClick={() => { onNavigate('dashboard'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard className="w-4 h-4 text-gray-400" /> Tableau de bord
                      </button>
                      <button onClick={() => { onNavigate('post-property'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Star className="w-4 h-4 text-gray-400" /> Publier une annonce
                      </button>
                      <button onClick={() => { onNavigate('agencies'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Building2 className="w-4 h-4 text-gray-400" /> Espace Agence
                      </button>
                      <button onClick={() => { onNavigate('favorites'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Heart className="w-4 h-4 text-gray-400" /> Mes favoris
                      </button>
                      <button onClick={() => { onNavigate('visits'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Calendar className="w-4 h-4 text-gray-400" /> Mes visites
                      </button>
                      <button onClick={() => { onNavigate('profile'); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4 text-gray-400" /> Mon profil
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="w-4 h-4" /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => onNavigate('login')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isHome ? 'text-white/90 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                  Connexion
                </button>
                <button onClick={() => onNavigate('register')}
                  className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                  Inscription
                </button>
              </div>
            )}

            <button className={`md:hidden p-2 rounded-lg ${isHome ? 'text-white' : 'text-gray-600'}`}
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {links.map(l => (
            <button key={l.page} onClick={() => { onNavigate(l.page); setMobileOpen(false); }}
              className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              {l.label}
            </button>
          ))}
          {!user && (
            <div className="pt-2 flex flex-col gap-2">
              <button onClick={() => { onNavigate('login'); setMobileOpen(false); }}
                className="w-full py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                Connexion
              </button>
              <button onClick={() => { onNavigate('register'); setMobileOpen(false); }}
                className="w-full py-2.5 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600">
                Inscription
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
