import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
import { ArrowLeft, ShoppingBag, MapPin, Package, Plus, Leaf, ShoppingCart, Minus } from 'lucide-react';

interface Listing {
  id: string;
  seller_id: string;
  crop_name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  description: string | null;
  location: string | null;
  image_url: string | null;
}

export default function Marketplace() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  
  const [newListing, setNewListing] = useState({
    crop_name: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    description: '',
    location: '',
  });

  const vegetables = ['tomato', 'potato', 'onion', 'carrot', 'cabbage', 'spinach', 'brinjal', 'cauliflower', 'beans', 'peas'];
  const fruits = ['mango', 'banana', 'apple', 'orange', 'grape', 'papaya', 'guava', 'pomegranate', 'watermelon'];
  const grains = ['rice', 'wheat', 'maize', 'corn', 'millet', 'barley', 'oats', 'sorghum'];

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (category && listings.length > 0) {
      let filtered = listings;
      if (category === 'vegetables') {
        filtered = listings.filter(l => vegetables.some(v => l.crop_name.toLowerCase().includes(v)));
      } else if (category === 'fruits') {
        filtered = listings.filter(l => fruits.some(f => l.crop_name.toLowerCase().includes(f)));
      } else if (category === 'grains') {
        filtered = listings.filter(l => grains.some(g => l.crop_name.toLowerCase().includes(g)));
      }
      setFilteredListings(filtered);
    } else {
      setFilteredListings(listings);
    }
  }, [category, listings]);

  const fetchListings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setListings(data);
    }
    setIsLoading(false);
  };

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('marketplace_listings').insert({
      seller_id: user.id,
      crop_name: newListing.crop_name,
      quantity: parseFloat(newListing.quantity),
      unit: newListing.unit,
      price_per_unit: parseFloat(newListing.price_per_unit),
      description: newListing.description || null,
      location: newListing.location || null,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add listing',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: 'Listing added to marketplace',
      });
      setIsDialogOpen(false);
      setNewListing({
        crop_name: '',
        quantity: '',
        unit: 'kg',
        price_per_unit: '',
        description: '',
        location: '',
      });
      fetchListings();
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedListing) return;

    if (orderQuantity > selectedListing.quantity) {
      toast({
        title: 'Insufficient stock',
        description: `Only ${selectedListing.quantity} ${selectedListing.unit} available`,
        variant: 'destructive',
      });
      return;
    }

    setIsOrdering(true);

    const totalAmount = orderQuantity * selectedListing.price_per_unit;

    const { error } = await supabase.from('orders').insert({
      buyer_id: user.id,
      seller_id: selectedListing.seller_id,
      listing_id: selectedListing.id,
      quantity: orderQuantity,
      unit: selectedListing.unit,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order',
        variant: 'destructive',
      });
    } else {
      // Update listing quantity
      const newQuantity = selectedListing.quantity - orderQuantity;
      await supabase
        .from('marketplace_listings')
        .update({ 
          quantity: newQuantity,
          is_available: newQuantity > 0 
        })
        .eq('id', selectedListing.id);

      toast({
        title: 'Order Placed! 🎉',
        description: `Your order for ${orderQuantity} ${selectedListing.unit} of ${selectedListing.crop_name} has been placed. Total: ₹${totalAmount}`,
      });
      setBuyDialogOpen(false);
      setOrderQuantity(1);
      setSelectedListing(null);
      fetchListings();
    }
    setIsOrdering(false);
  };

  const getCropEmoji = (crop: string) => {
    const emojis: Record<string, string> = {
      rice: '🌾',
      wheat: '🌾',
      tomato: '🍅',
      potato: '🥔',
      onion: '🧅',
      carrot: '🥕',
      corn: '🌽',
      apple: '🍎',
      mango: '🥭',
      banana: '🍌',
      orange: '🍊',
      grape: '🍇',
      spinach: '🥬',
      cabbage: '🥬',
      beans: '🫘',
    };
    return emojis[crop.toLowerCase()] || '🌿';
  };

  const getCategoryTitle = () => {
    if (category === 'vegetables') return 'Vegetables';
    if (category === 'fruits') return 'Fruits';
    if (category === 'grains') return 'Grains';
    return 'Marketplace';
  };

  const openBuyDialog = (listing: Listing) => {
    setSelectedListing(listing);
    setOrderQuantity(1);
    setBuyDialogOpen(true);
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
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-serif font-bold text-foreground">{getCategoryTitle()}</h1>
                  <p className="text-xs text-muted-foreground">Buy and sell fresh produce</p>
                </div>
              </div>
            </div>
            
            {profile?.role === 'farmer' && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Sell Produce
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-serif">List Your Produce</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddListing} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="crop_name">Crop Name</Label>
                      <Input
                        id="crop_name"
                        placeholder="e.g., Rice, Wheat, Tomato"
                        value={newListing.crop_name}
                        onChange={(e) => setNewListing({ ...newListing, crop_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="e.g., 100"
                          value={newListing.quantity}
                          onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select value={newListing.unit} onValueChange={(v) => setNewListing({ ...newListing, unit: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">Kilograms</SelectItem>
                            <SelectItem value="quintal">Quintals</SelectItem>
                            <SelectItem value="ton">Tons</SelectItem>
                            <SelectItem value="pieces">Pieces</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price/unit (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="e.g., 50"
                          value={newListing.price_per_unit}
                          onChange={(e) => setNewListing({ ...newListing, price_per_unit: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="Village, District"
                        value={newListing.location}
                        onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe quality, variety, harvest date, etc."
                        value={newListing.description}
                        onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">Add to Marketplace</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      {/* Buy Dialog */}
      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Buy {selectedListing?.crop_name}
            </DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-6">
              {/* Product Summary */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <span className="text-4xl">{getCropEmoji(selectedListing.crop_name)}</span>
                <div>
                  <h3 className="font-semibold capitalize">{selectedListing.crop_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ₹{selectedListing.price_per_unit} per {selectedListing.unit}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Available: {selectedListing.quantity} {selectedListing.unit}
                  </p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <Label>Select Quantity ({selectedListing.unit})</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    disabled={orderQuantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={selectedListing.quantity}
                    value={orderQuantity}
                    onChange={(e) => {
                      const val = Math.min(
                        Math.max(1, parseInt(e.target.value) || 1),
                        selectedListing.quantity
                      );
                      setOrderQuantity(val);
                    }}
                    className="w-24 text-center text-lg font-semibold"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setOrderQuantity(Math.min(selectedListing.quantity, orderQuantity + 1))}
                    disabled={orderQuantity >= selectedListing.quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {orderQuantity > selectedListing.quantity && (
                  <p className="text-sm text-destructive">
                    Maximum available: {selectedListing.quantity} {selectedListing.unit}
                  </p>
                )}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per {selectedListing.unit}</span>
                  <span>₹{selectedListing.price_per_unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span>{orderQuantity} {selectedListing.unit}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">₹{(orderQuantity * selectedListing.price_per_unit).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setBuyDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handlePlaceOrder}
                  disabled={isOrdering || orderQuantity > selectedListing.quantity}
                >
                  {isOrdering ? 'Placing Order...' : 'Place Order'}
                </Button>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                Payment will be collected on delivery (COD)
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <Leaf className="w-12 h-12 text-primary" />
              <p className="text-muted-foreground">Loading marketplace...</p>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No listings yet</h3>
              <p className="text-muted-foreground">Be the first to list your produce!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-card transition-shadow group">
                <div className="h-40 bg-gradient-to-br from-accent to-muted flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                  {getCropEmoji(listing.crop_name)}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-serif text-lg capitalize">{listing.crop_name}</CardTitle>
                      {listing.location && (
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {listing.location}
                        </CardDescription>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      <Package className="w-3 h-3" />
                      {listing.quantity} {listing.unit}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {listing.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{listing.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">₹{listing.price_per_unit}</p>
                      <p className="text-xs text-muted-foreground">per {listing.unit}</p>
                    </div>
                    {profile?.role === 'buyer' && user && (
                      <Button 
                        size="sm"
                        onClick={() => openBuyDialog(listing)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Now
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
