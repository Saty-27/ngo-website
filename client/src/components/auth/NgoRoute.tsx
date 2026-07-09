import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import useNgoAuth from '@/hooks/useNgoAuth';
import { Loader2 } from 'lucide-react';

interface NgoRouteProps {
  children: ReactNode;
}

const NgoRoute = ({ children }: NgoRouteProps) => {
  const { isAuthenticated, ngo, isLoading } = useNgoAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/ngo/login');
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default NgoRoute;
