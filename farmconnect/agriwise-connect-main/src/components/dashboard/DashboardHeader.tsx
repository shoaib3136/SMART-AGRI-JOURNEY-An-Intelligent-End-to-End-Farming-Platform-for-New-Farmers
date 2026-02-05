import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  fullName: string | null;
  role: string | null;
  onSignOut: () => void;
}

export function DashboardHeader({ fullName, role, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="bg-card shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-serif font-bold text-foreground">AgriSmart</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-foreground">{fullName || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{role || 'user'}</p>
            </div>
            <Button variant="outline" size="icon" onClick={onSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
