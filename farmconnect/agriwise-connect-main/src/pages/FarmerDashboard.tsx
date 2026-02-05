import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Bug, Droplets, ShoppingBag, TrendingUp } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WeatherCard } from '@/components/dashboard/WeatherCard';

interface FarmerDashboardProps {
  fullName: string | null;
  onSignOut: () => void;
}

export default function FarmerDashboard({ fullName, onSignOut }: FarmerDashboardProps) {
  const quickActions = [
    {
      title: 'Crop Prediction',
      description: 'Get AI-powered crop recommendations based on your soil and weather conditions',
      icon: Sprout,
      href: '/crop-prediction',
      color: 'bg-agri-leaf/10 text-agri-leaf',
    },
    {
      title: 'Fertilizer Guide',
      description: 'Calculate optimal fertilizer requirements for maximum yield',
      icon: TrendingUp,
      href: '/fertilizer',
      color: 'bg-agri-gold/10 text-agri-earth',
    },
    {
      title: 'Disease Detection',
      description: 'Upload leaf images to detect diseases and get treatment advice',
      icon: Bug,
      href: '/disease-detection',
      color: 'bg-destructive/10 text-destructive',
    },
    {
      title: 'Water Management',
      description: 'Monitor soil moisture and optimize your irrigation schedules',
      icon: Droplets,
      href: '/water-management',
      color: 'bg-agri-water/10 text-agri-water',
    },
    {
      title: 'Sell Your Produce',
      description: 'List your harvested crops directly to buyers, no middlemen',
      icon: ShoppingBag,
      href: '/marketplace',
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader fullName={fullName} role="farmer" onSignOut={onSignOut} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Welcome back, {fullName?.split(' ')[0] || 'Farmer'}! 🌾
          </h1>
          <p className="text-muted-foreground">
            Manage your crops, get AI-powered insights, and sell directly to buyers.
          </p>
        </div>

        {/* Weather Card */}
        <div className="mb-8">
          <WeatherCard />
        </div>

        {/* Quick Actions Grid */}
        <h2 className="text-xl font-serif font-semibold text-foreground mb-4">Farm Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="h-full hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-serif">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
