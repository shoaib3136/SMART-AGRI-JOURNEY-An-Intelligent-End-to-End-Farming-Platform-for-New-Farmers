import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Eye, Layers, TrendingUp, Bell, CheckCircle, User, Phone, Mail, Edit } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LandownerDashboardProps {
  fullName: string | null;
  onSignOut: () => void;
}

interface Land {
  id: string;
  title: string;
  location: string;
  area_acres: number;
  price_per_month: number;
  is_available: boolean;
  soil_type: string | null;
}

interface Inquiry {
  id: string;
  buyer_id: string;
  listing_id: string;
  listing_type: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  buyer_name?: string;
  land_title?: string;
}

interface ProfileData {
  full_name: string | null;
  phone: string | null;
  email: string;
}

export default function LandownerDashboard({ fullName, onSignOut }: LandownerDashboardProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [lands, setLands] = useState<Land[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    email: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyLands();
      fetchInquiries();
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, email')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfileData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        email: data.email || '',
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.full_name,
        phone: profileData.phone,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile Updated!',
        description: 'Your contact details have been saved. Buyers can now see your contact information.',
      });
      setProfileDialogOpen(false);
    }
    setIsSaving(false);
  };

  const fetchMyLands = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('lands')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLands(data);
    }
    setLoading(false);
  };

  const fetchInquiries = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('buyer_inquiries')
      .select('*')
      .eq('seller_id', user.id)
      .eq('listing_type', 'land')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch buyer names and land titles
      const enrichedInquiries = await Promise.all(
        data.map(async (inquiry) => {
          const { data: buyerData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', inquiry.buyer_id)
            .single();

          const { data: landData } = await supabase
            .from('lands')
            .select('title')
            .eq('id', inquiry.listing_id)
            .single();

          return {
            ...inquiry,
            buyer_name: buyerData?.full_name || 'Unknown Buyer',
            land_title: landData?.title || 'Unknown Land',
          };
        })
      );
      setInquiries(enrichedInquiries);
    }
  };

  const markAsRead = async (inquiryId: string) => {
    await supabase
      .from('buyer_inquiries')
      .update({ is_read: true })
      .eq('id', inquiryId);
    
    setInquiries(prev => prev.map(inq => 
      inq.id === inquiryId ? { ...inq, is_read: true } : inq
    ));
  };

  const unreadCount = inquiries.filter(i => !i.is_read).length;
  const hasContactDetails = profileData.phone && profileData.phone.length > 0;

  const stats = [
    { label: 'Total Lands', value: lands.length.toString(), icon: Layers, color: 'text-agri-earth' },
    { label: 'Available', value: lands.filter(l => l.is_available).length.toString(), icon: Eye, color: 'text-agri-leaf' },
    { label: 'New Inquiries', value: unreadCount.toString(), icon: Bell, color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader fullName={fullName} role="landowner" onSignOut={onSignOut} />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Welcome, {fullName?.split(' ')[0] || 'Landowner'}! 🏞️
            </h1>
            <p className="text-muted-foreground">
              Manage your land listings and connect with potential buyers.
            </p>
          </div>
          <div className="flex gap-3">
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="w-4 h-4" />
                  My Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Contact Details
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Add your contact details so buyers can reach you directly when interested in your land.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.full_name || ''}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={profileData.phone || ''}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                    <p className="text-xs text-muted-foreground">Buyers will see this to contact you</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <Button onClick={handleSaveProfile} className="w-full" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Contact Details'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Link to="/lands">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add New Land
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Alert */}
        {!hasContactDetails && (
          <Card className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Add your contact details</p>
                  <p className="text-sm text-muted-foreground">Buyers need your phone number to contact you about land listings</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setProfileDialogOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Add Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notifications Card */}
        {inquiries.length > 0 && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Buyer Inquiries
                {unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {inquiries.slice(0, 5).map((inquiry) => (
                <div 
                  key={inquiry.id} 
                  className={`p-4 rounded-lg border ${!inquiry.is_read ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {inquiry.buyer_name} is interested in <span className="text-primary">{inquiry.land_title}</span>
                      </p>
                      {inquiry.message && (
                        <p className="text-sm text-muted-foreground mt-1">"{inquiry.message}"</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(inquiry.created_at).toLocaleDateString('en-IN', { 
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!inquiry.is_read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => markAsRead(inquiry.id)}
                        className="text-primary"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Revenue Card */}
        <Card className="mb-8 bg-gradient-hero text-primary-foreground shadow-elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-medium opacity-90 mb-1">Potential Monthly Revenue</h3>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold">
                    ₹{lands.filter(l => l.is_available).reduce((sum, l) => sum + l.price_per_month, 0).toLocaleString()}
                  </span>
                  <div className="text-sm opacity-80">
                    <p>From {lands.filter(l => l.is_available).length} available lands</p>
                  </div>
                </div>
              </div>
              <TrendingUp className="w-16 h-16 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* My Lands */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold text-foreground">My Land Listings</h2>
          <Link to="/lands" className="text-primary hover:underline text-sm font-medium">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading your lands...</div>
        ) : lands.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Lands Listed Yet</h3>
              <p className="text-muted-foreground mb-6">Start by adding your first land listing to reach potential buyers.</p>
              <Link to="/lands">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Land
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lands.slice(0, 6).map((land) => (
              <Card key={land.id} className="hover:shadow-card transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-serif">{land.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {land.location}
                      </CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      land.is_available 
                        ? 'bg-agri-leaf/10 text-agri-leaf' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {land.is_available ? 'Available' : 'Rented'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{land.area_acres} acres</span>
                    <span className="font-semibold text-primary">₹{land.price_per_month.toLocaleString()}/mo</span>
                  </div>
                  {land.soil_type && (
                    <p className="text-xs text-muted-foreground mt-2">Soil: {land.soil_type}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tips Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-serif">Tips for Better Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-agri-leaf">✓</span>
                Add clear photos of your land to attract more buyers
              </li>
              <li className="flex items-start gap-2">
                <span className="text-agri-leaf">✓</span>
                Mention water availability and soil type for better matches
              </li>
              <li className="flex items-start gap-2">
                <span className="text-agri-leaf">✓</span>
                Keep your pricing competitive with nearby listings
              </li>
              <li className="flex items-start gap-2">
                <span className="text-agri-leaf">✓</span>
                Keep your contact details updated for faster communication
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
