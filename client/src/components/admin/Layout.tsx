import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { OnboardingProvider } from './OnboardingProvider';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <OnboardingProvider>
      <div className="w-full md:grid md:grid-cols-[256px_1fr]">
        {/* Sidebar - returns mobile header, overlay, and sidebar */}
        <Sidebar />
        
        {/* Content wrapper - takes remaining space on desktop */}
        <div>
          {/* Desktop Header */}
          <div className="hidden md:block bg-white border-b border-gray-200">
            <Header />
          </div>
          
          {/* Main content */}
          <main className="pt-16 md:pt-0 bg-white md:bg-gray-50 p-4 md:px-6 md:py-4">
            {children}
          </main>
        </div>
      </div>
    </OnboardingProvider>
  );
};

export default Layout;
