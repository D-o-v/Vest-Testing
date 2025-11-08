import { useEffect } from 'react';
import { useNavigate, useLocation } from '@/lib/hooks/use-router';
import { useAuth } from '@/lib/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Save the attempted url to redirect back after login
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}