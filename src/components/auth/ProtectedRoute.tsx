import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If Supabase is not configured, show demo mode
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold">Supabase Not Configured</h2>
          <p className="text-muted-foreground">
            Please add <code className="bg-muted px-2 py-1 rounded text-sm">VITE_SUPABASE_URL</code> and{' '}
            <code className="bg-muted px-2 py-1 rounded text-sm">VITE_SUPABASE_ANON_KEY</code> to your{' '}
            <code className="bg-muted px-2 py-1 rounded text-sm">.env</code> file to enable authentication.
          </p>
          <p className="text-sm text-muted-foreground">
            See <code className="bg-muted px-1 rounded">.env.example</code> for reference.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to home with return URL
    return <Navigate to="/" state={{ from: location, openAuth: true }} replace />;
  }

  return <>{children}</>;
};
