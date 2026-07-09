import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import useNgoAuth from '@/hooks/useNgoAuth';
import { Home, FileText, Heart, User, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NgoSidebar = () => {
  const [location] = useLocation();
  const { ngo, logout } = useNgoAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/ngo/dashboard', label: 'Dashboard', icon: Home },
    { path: '/ngo/campaigns', label: 'Campaigns', icon: FileText },
    { path: '/ngo/donations', label: 'Donations', icon: Heart },
    { path: '/ngo/profile', label: 'Profile', icon: User },
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/60 h-16 flex items-center px-4 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="hover:bg-gray-100"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </Button>
        <span className="ml-3 font-bold text-lg bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
          {ngo?.name || 'NGO Portal'}
        </span>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-gray-50/80 border-r border-gray-200/60 transform transition-transform duration-300 ease-out md:translate-x-0 md:static ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo / Brand */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-gray-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {(ngo?.name || 'N')[0].toUpperCase()}
                </span>
              </div>
              <span className="font-bold text-base text-gray-900 truncate max-w-[160px]">
                {ngo?.name || 'NGO Portal'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.path || (item.path !== '/ngo/dashboard' && location.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-200'
                        : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      {item.label}
                    </span>
                    {isActive && <ChevronRight className="h-4 w-4 text-white/60" />}
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="border-t border-gray-200/60 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-50/80 transition-colors"
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NgoSidebar;
