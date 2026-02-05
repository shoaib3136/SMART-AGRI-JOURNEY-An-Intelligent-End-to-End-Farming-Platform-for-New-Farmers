import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Sprout, Loader2, CheckCircle, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

// Crop recommendation logic based on soil parameters
const recommendCrop = (nitrogen: number, phosphorus: number, potassium: number, ph: number, season: string): { crop: string; confidence: number; tips: string[] } => {
  const crops = [];
  
  // Rice conditions
  if (nitrogen >= 50 && nitrogen <= 100 && phosphorus >= 30 && potassium >= 30 && ph >= 5.5 && ph <= 7.5) {
    crops.push({ crop: 'Rice', score: 85, tips: ['Maintain waterlogged conditions', 'Best planted in monsoon season'] });
  }
  
  // Wheat conditions
  if (nitrogen >= 40 && nitrogen <= 80 && phosphorus >= 20 && potassium >= 20 && ph >= 6.0 && ph <= 7.5 && season === 'winter') {
    crops.push({ crop: 'Wheat', score: 90, tips: ['Requires cool weather', 'Irrigate at critical stages'] });
  }
  
  // Maize/Corn conditions
  if (nitrogen >= 60 && phosphorus >= 25 && potassium >= 25 && ph >= 5.8 && ph <= 7.0) {
    crops.push({ crop: 'Maize', score: 80, tips: ['Needs well-drained soil', 'Regular irrigation required'] });
  }
  
  // Sugarcane conditions
  if (nitrogen >= 80 && phosphorus >= 40 && potassium >= 40 && ph >= 6.0 && ph <= 7.5) {
    crops.push({ crop: 'Sugarcane', score: 75, tips: ['Long growing season', 'Heavy water requirement'] });
  }
  
  // Cotton conditions
  if (nitrogen >= 40 && phosphorus >= 20 && potassium >= 20 && ph >= 6.0 && ph <= 8.0 && season === 'summer') {
    crops.push({ crop: 'Cotton', score: 82, tips: ['Warm climate preferred', 'Moderate water needs'] });
  }
  
  // Soybean conditions
  if (nitrogen >= 30 && phosphorus >= 20 && potassium >= 30 && ph >= 6.0 && ph <= 7.0) {
    crops.push({ crop: 'Soybean', score: 78, tips: ['Fixes nitrogen in soil', 'Good rotation crop'] });
  }
  
  // Groundnut/Peanut conditions
  if (nitrogen >= 20 && phosphorus >= 30 && potassium >= 20 && ph >= 5.5 && ph <= 7.0) {
    crops.push({ crop: 'Groundnut', score: 77, tips: ['Sandy loam soil preferred', 'Moderate water needs'] });
  }
  
  // Default recommendation
  if (crops.length === 0) {
    if (ph < 6.0) {
      return { crop: 'Potato', confidence: 65, tips: ['Acidic soil suitable for potatoes', 'Consider adding lime to raise pH'] };
    } else if (nitrogen < 40) {
      return { crop: 'Legumes', confidence: 70, tips: ['Low nitrogen suggests legumes', 'Will help fix nitrogen in soil'] };
    } else {
      return { crop: 'Vegetables', confidence: 60, tips: ['Mixed vegetable cultivation', 'Consider soil amendments'] };
    }
  }
  
  // Return highest scoring crop
  crops.sort((a, b) => b.score - a.score);
  return { crop: crops[0].crop, confidence: crops[0].score, tips: crops[0].tips };
};

export default function CropPrediction() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ crop: string; confidence: number; tips: string[] } | null>(null);
  
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    temperature: '',
    humidity: '',
    rainfall: '',
    season: 'monsoon',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    
    try {
      const nitrogen = parseFloat(formData.nitrogen);
      const phosphorus = parseFloat(formData.phosphorus);
      const potassium = parseFloat(formData.potassium);
      const ph = parseFloat(formData.ph);
      
      // Get recommendation
      const recommendation = recommendCrop(nitrogen, phosphorus, potassium, ph, formData.season);
      
      // Save to database
      const { error } = await supabase.from('crop_predictions').insert({
        user_id: user.id,
        nitrogen,
        phosphorus,
        potassium,
        ph_level: ph,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        humidity: formData.humidity ? parseFloat(formData.humidity) : null,
        rainfall: formData.rainfall ? parseFloat(formData.rainfall) : null,
        season: formData.season,
        recommended_crop: recommendation.crop,
        confidence: recommendation.confidence,
      });
      
      if (error) throw error;
      
      setResult(recommendation);
      
      toast({
        title: 'Prediction Complete!',
        description: `Recommended crop: ${recommendation.crop}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get prediction',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-agri-leaf/10 rounded-xl flex items-center justify-center">
                <Sprout className="w-6 h-6 text-agri-leaf" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold text-foreground">Crop Prediction</h1>
                <p className="text-xs text-muted-foreground">AI-powered recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Soil & Weather Analysis</CardTitle>
            <CardDescription>
              Enter your soil parameters and weather conditions to get personalized crop recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NPK Values */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Soil Nutrients (NPK)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                    <Input
                      id="nitrogen"
                      type="number"
                      placeholder="mg/kg"
                      value={formData.nitrogen}
                      onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                    <Input
                      id="phosphorus"
                      type="number"
                      placeholder="mg/kg"
                      value={formData.phosphorus}
                      onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="potassium">Potassium (K)</Label>
                    <Input
                      id="potassium"
                      type="number"
                      placeholder="mg/kg"
                      value={formData.potassium}
                      onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* pH Level */}
              <div className="space-y-2">
                <Label htmlFor="ph">Soil pH Level</Label>
                <Input
                  id="ph"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  placeholder="e.g., 6.5"
                  value={formData.ph}
                  onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                  required
                />
              </div>

              {/* Weather Conditions */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Weather Conditions (Optional)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      placeholder="e.g., 28"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="humidity">Humidity (%)</Label>
                    <Input
                      id="humidity"
                      type="number"
                      placeholder="e.g., 65"
                      value={formData.humidity}
                      onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rainfall">Rainfall (mm)</Label>
                    <Input
                      id="rainfall"
                      type="number"
                      placeholder="e.g., 150"
                      value={formData.rainfall}
                      onChange={(e) => setFormData({ ...formData, rainfall: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Season */}
              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Select value={formData.season} onValueChange={(v) => setFormData({ ...formData, season: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monsoon">Monsoon (Kharif)</SelectItem>
                    <SelectItem value="winter">Winter (Rabi)</SelectItem>
                    <SelectItem value="summer">Summer (Zaid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sprout className="w-4 h-4 mr-2" />
                    Get Crop Recommendation
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Card */}
        {result && (
          <Card className="mt-6 shadow-card border-2 border-primary/20 animate-scale-in">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl">Recommended Crop</CardTitle>
                  <CardDescription>Based on your soil and weather analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-accent rounded-xl p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Leaf className="w-8 h-8 text-primary" />
                    <span className="text-3xl font-serif font-bold text-foreground">{result.crop}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-2xl font-bold text-primary">{result.confidence}%</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all duration-500"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Growing Tips</h4>
                <ul className="space-y-2">
                  {result.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
