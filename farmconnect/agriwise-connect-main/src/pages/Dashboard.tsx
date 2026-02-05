import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf } from 'lucide-react';
import FarmerDashboard from './FarmerDashboard';
import BuyerDashboard from './BuyerDashboard';
import LandownerDashboard from './LandownerDashboard';

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Leaf className="w-12 h-12 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Render role-specific dashboard
  switch (profile?.role) {
    case 'buyer':
      return <BuyerDashboard fullName={profile?.full_name} onSignOut={handleSignOut} />;
    case 'landowner':
      return <LandownerDashboard fullName={profile?.full_name} onSignOut={handleSignOut} />;
    case 'farmer':
    default:
      return <FarmerDashboard fullName={profile?.full_name} onSignOut={handleSignOut} />;
  }
}
