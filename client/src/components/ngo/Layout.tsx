import { ReactNode } from 'react';
import NgoSidebar from './Sidebar';

interface NgoLayoutProps {
  children: ReactNode;
  title?: string;
}

const NgoLayout = ({ children }: NgoLayoutProps) => {
  return (
    <div className="w-full md:grid md:grid-cols-[256px_1fr] min-h-screen bg-gray-50/50">
      <NgoSidebar />

      <div className="overflow-y-auto">
        <main className="pt-16 md:pt-0 p-4 md:px-8 md:py-6 min-h-screen max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export default NgoLayout;
