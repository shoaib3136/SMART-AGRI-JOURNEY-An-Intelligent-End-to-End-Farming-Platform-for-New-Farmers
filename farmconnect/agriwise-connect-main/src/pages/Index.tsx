import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Sprout, Bug, Droplets, ShoppingBag, MapPin, ArrowRight, CheckCircle } from 'lucide-react';

export default function Index() {
  const features = [
    { icon: Sprout, title: 'Crop Prediction', description: 'AI-powered recommendations based on soil & weather' },
    { icon: Bug, title: 'Disease Detection', description: 'Upload leaf images for instant diagnosis' },
    { icon: Droplets, title: 'Water Management', description: 'Smart irrigation monitoring & scheduling' },
    { icon: MapPin, title: 'Land Rental', description: 'Find or list agricultural land easily' },
    { icon: ShoppingBag, title: 'Direct Marketplace', description: 'Sell produce without middlemen' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-card/80 backdrop-blur-md z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-serif font-bold text-foreground">AgriSmart</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full text-sm text-accent-foreground mb-6">
            <Leaf className="w-4 h-4" />
            AI-Powered Agricultural Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
            Empowering Farmers with <span className="text-gradient-hero">Smart Technology</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get AI-powered crop recommendations, detect plant diseases instantly, manage irrigation smartly, and sell your produce directly to buyers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Start Farming Smarter
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-accent/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center text-foreground mb-12">
            Everything You Need to Farm Better
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-card transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold mb-6">Ready to Transform Your Farming?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of farmers already using AgriSmart to increase yields and reduce costs.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 AgriSmart. Empowering farmers with technology.</p>
        </div>
      </footer>
    </div>
  );
}
