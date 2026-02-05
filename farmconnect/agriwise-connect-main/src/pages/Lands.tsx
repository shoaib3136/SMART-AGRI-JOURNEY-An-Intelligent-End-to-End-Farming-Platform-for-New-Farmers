import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Droplets, Ruler, Plus, Leaf, Phone, Mail, User, MessageSquare } from 'lucide-react';

interface Land {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  location: string;
  area_acres: number;
  soil_type: string | null;
  water_availability: string | null;
  price_per_month: number;
  image_url: string | null;
}

interface OwnerContact {
  full_name: string | null;
  phone: string | null;
  email: string;
}

export default function Lands() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [lands, setLands] = useState<Land[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedLand, setSelectedLand] = useState<Land | null>(null);
  const [ownerContact, setOwnerContact] = useState<OwnerContact | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);
  
  const [newLand, setNewLand] = useState({
    title: '',
    description: '',
    location: '',
    area_acres: '',
    soil_type: '',
    water_availability: '',
    price_per_month: '',
  });

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('lands')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLands(data);
    }
    setIsLoading(false);
  };

  const handleAddLand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('lands').insert({
      owner_id: user.id,
      title: newLand.title,
      description: newLand.description || null,
      location: newLand.location,
      area_acres: parseFloat(newLand.area_acres),
      soil_type: newLand.soil_type || null,
      water_availability: newLand.water_availability || null,
      price_per_month: parseFloat(newLand.price_per_month),
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add land listing',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: 'Land listing added successfully',
      });
      setIsDialogOpen(false);
      setNewLand({
        title: '',
        description: '',
        location: '',
        area_acres: '',
        soil_type: '',
        water_availability: '',
        price_per_month: '',
      });
      fetchLands();
    }
  };

  const handleContactOwner = async (land: Land) => {
    setSelectedLand(land);
    setLoadingContact(true);
    setContactDialogOpen(true);

    // Fetch owner contact details
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, email')
      .eq('id', land.owner_id)
      .single();

    if (data) {
      setOwnerContact(data);
    }
    setLoadingContact(false);

    // Also create an inquiry record
    if (user) {
      await supabase.from('buyer_inquiries').insert({
        buyer_id: user.id,
        seller_id: land.owner_id,
        listing_type: 'land',
        listing_id: land.id,
        message: 'Viewed contact details',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-agri-earth/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-agri-earth" />
                </div>
                <div>
                  <h1 className="text-lg font-serif font-bold text-foreground">Land Listings</h1>
                  <p className="text-xs text-muted-foreground">Find or list agricultural land</p>
                </div>
              </div>
            </div>
            
            {profile?.role === 'landowner' && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Land
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-serif">Add New Land Listing</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddLand} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Fertile Farmland near River"
                        value={newLand.title}
                        onChange={(e) => setNewLand({ ...newLand, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="Village, District, State"
                        value={newLand.location}
                        onChange={(e) => setNewLand({ ...newLand, location: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="area">Area (acres)</Label>
                        <Input
                          id="area"
                          type="number"
                          placeholder="e.g., 5"
                          value={newLand.area_acres}
                          onChange={(e) => setNewLand({ ...newLand, area_acres: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price/month (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="e.g., 10000"
                          value={newLand.price_per_month}
                          onChange={(e) => setNewLand({ ...newLand, price_per_month: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="soil">Soil Type</Label>
                        <Select value={newLand.soil_type} onValueChange={(v) => setNewLand({ ...newLand, soil_type: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alluvial">Alluvial</SelectItem>
                            <SelectItem value="black">Black</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="laterite">Laterite</SelectItem>
                            <SelectItem value="sandy">Sandy</SelectItem>
                            <SelectItem value="loamy">Loamy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="water">Water Availability</Label>
                        <Select value={newLand.water_availability} onValueChange={(v) => setNewLand({ ...newLand, water_availability: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="canal">Canal Irrigation</SelectItem>
                            <SelectItem value="borewell">Borewell</SelectItem>
                            <SelectItem value="river">River Nearby</SelectItem>
                            <SelectItem value="rainfed">Rainfed Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the land, previous crops grown, etc."
                        value={newLand.description}
                        onChange={(e) => setNewLand({ ...newLand, description: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">List Land</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      {/* Contact Owner Dialog - Shows contact details */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Landowner Contact
            </DialogTitle>
          </DialogHeader>
          {loadingContact ? (
            <div className="py-8 text-center text-muted-foreground">Loading contact details...</div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Land</p>
                <p className="font-semibold text-foreground">{selectedLand?.title}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {selectedLand?.location}
                </p>
              </div>

              {ownerContact?.phone ? (
                <div className="space-y-3">
                  <div className="p-4 border rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{ownerContact.full_name || 'Landowner'}</p>
                        <p className="text-sm text-muted-foreground">Property Owner</p>
                      </div>
                    </div>
                    <div className="border-t pt-3 space-y-2">
                      <a 
                        href={`tel:${ownerContact.phone}`}
                        className="flex items-center gap-3 p-3 bg-agri-leaf/10 rounded-lg hover:bg-agri-leaf/20 transition-colors"
                      >
                        <Phone className="w-5 h-5 text-agri-leaf" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium text-foreground">{ownerContact.phone}</p>
                        </div>
                      </a>
                      <a 
                        href={`mailto:${ownerContact.email}`}
                        className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <Mail className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium text-foreground">{ownerContact.email}</p>
                        </div>
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Contact the landowner directly to discuss the property
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Contact Not Available</h3>
                  <p className="text-sm text-muted-foreground">
                    The landowner has not added their contact details yet. 
                    Please check back later.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <Leaf className="w-12 h-12 text-primary" />
              <p className="text-muted-foreground">Loading lands...</p>
            </div>
          </div>
        ) : lands.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No lands available</h3>
              <p className="text-muted-foreground">Check back later for new listings</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lands.map((land) => (
              <Card key={land.id} className="overflow-hidden hover:shadow-card transition-shadow">
                <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-primary/30" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-lg">{land.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {land.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Ruler className="w-4 h-4" />
                        {land.area_acres} acres
                      </span>
                      {land.water_availability && (
                        <span className="flex items-center gap-1">
                          <Droplets className="w-4 h-4" />
                          {land.water_availability}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">₹{land.price_per_month.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                    {profile?.role === 'buyer' && user && (
                      <Button onClick={() => handleContactOwner(land)}>
                        <Phone className="w-4 h-4 mr-2" />
                        Get Contact
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
