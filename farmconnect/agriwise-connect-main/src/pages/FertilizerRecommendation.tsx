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
import { ArrowLeft, TrendingUp, Loader2, CheckCircle, Beaker } from 'lucide-react';
import { Link } from 'react-router-dom';

// Optimal NPK levels for different crops
const cropNPKRequirements: Record<string, { N: number; P: number; K: number }> = {
  rice: { N: 80, P: 40, K: 40 },
  wheat: { N: 60, P: 30, K: 30 },
  maize: { N: 100, P: 50, K: 50 },
  sugarcane: { N: 150, P: 60, K: 60 },
  cotton: { N: 80, P: 40, K: 40 },
  soybean: { N: 20, P: 40, K: 40 },
  groundnut: { N: 20, P: 40, K: 30 },
  potato: { N: 100, P: 80, K: 100 },
  tomato: { N: 80, P: 60, K: 80 },
  onion: { N: 60, P: 40, K: 60 },
};

const getFertilizerRecommendation = (
  crop: string,
  currentN: number,
  currentP: number,
  currentK: number
): { fertilizer: string; quantity: number; schedule: string; details: string[] } => {
  const optimal = cropNPKRequirements[crop] || { N: 60, P: 30, K: 30 };
  
  const nDeficit = Math.max(0, optimal.N - currentN);
  const pDeficit = Math.max(0, optimal.P - currentP);
  const kDeficit = Math.max(0, optimal.K - currentK);
  
  let fertilizer = '';
  let quantity = 0;
  let schedule = '';
  const details: string[] = [];
  
  // Determine primary deficiency
  if (nDeficit >= pDeficit && nDeficit >= kDeficit && nDeficit > 10) {
    fertilizer = 'Urea (46-0-0)';
    quantity = Math.round((nDeficit / 0.46) * 2.2); // kg per acre
    schedule = 'Split application: 50% at sowing, 25% at 30 days, 25% at 60 days';
    details.push(`Nitrogen deficiency: ${nDeficit} mg/kg below optimal`);
    details.push('Urea provides fast-release nitrogen for leafy growth');
  } else if (pDeficit >= nDeficit && pDeficit >= kDeficit && pDeficit > 10) {
    fertilizer = 'DAP (18-46-0)';
    quantity = Math.round((pDeficit / 0.46) * 2.2);
    schedule = 'Apply 100% as basal dose before sowing';
    details.push(`Phosphorus deficiency: ${pDeficit} mg/kg below optimal`);
    details.push('DAP promotes root development and flowering');
  } else if (kDeficit > 10) {
    fertilizer = 'MOP (0-0-60)';
    quantity = Math.round((kDeficit / 0.60) * 2.2);
    schedule = 'Apply 50% at sowing, 50% at flowering stage';
    details.push(`Potassium deficiency: ${kDeficit} mg/kg below optimal`);
    details.push('MOP improves disease resistance and crop quality');
  } else {
    fertilizer = 'NPK Complex (10-26-26)';
    quantity = Math.round(50 * 2.2);
    schedule = 'Apply as basal dose at sowing time';
    details.push('Soil nutrients are near optimal levels');
    details.push('Maintenance fertilization recommended');
  }
  
  // Add secondary recommendations
  if (nDeficit > 20 && fertilizer !== 'Urea (46-0-0)') {
    details.push(`Also apply Urea: ${Math.round((nDeficit / 0.46) * 1.5)} kg/acre for nitrogen`);
  }
  if (pDeficit > 20 && fertilizer !== 'DAP (18-46-0)') {
    details.push(`Also apply DAP: ${Math.round((pDeficit / 0.46) * 1.5)} kg/acre for phosphorus`);
  }
  if (kDeficit > 20 && fertilizer !== 'MOP (0-0-60)') {
    details.push(`Also apply MOP: ${Math.round((kDeficit / 0.60) * 1.5)} kg/acre for potassium`);
  }
  
  return { fertilizer, quantity, schedule, details };
};

export default function FertilizerRecommendation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ fertilizer: string; quantity: number; schedule: string; details: string[] } | null>(null);
  
  const [formData, setFormData] = useState({
    crop: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
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
      
      const recommendation = getFertilizerRecommendation(formData.crop, nitrogen, phosphorus, potassium);
      
      // Save to database
      const { error } = await supabase.from('fertilizer_recommendations').insert({
        user_id: user.id,
        crop_type: formData.crop,
        nitrogen_level: nitrogen,
        phosphorus_level: phosphorus,
        potassium_level: potassium,
        recommended_fertilizer: recommendation.fertilizer,
        quantity_per_acre: recommendation.quantity,
        application_schedule: recommendation.schedule,
      });
      
      if (error) throw error;
      
      setResult(recommendation);
      
      toast({
        title: 'Recommendation Ready!',
        description: `Suggested: ${recommendation.fertilizer}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get recommendation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const crops = Object.keys(cropNPKRequirements);

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
              <div className="w-10 h-10 bg-agri-gold/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-agri-earth" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold text-foreground">Fertilizer Guide</h1>
                <p className="text-xs text-muted-foreground">Optimize your crop nutrition</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Fertilizer Calculator</CardTitle>
            <CardDescription>
              Enter your current soil nutrients and crop type to get optimal fertilizer recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Crop Selection */}
              <div className="space-y-2">
                <Label htmlFor="crop">Crop Type</Label>
                <Select value={formData.crop} onValueChange={(v) => setFormData({ ...formData, crop: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop} value={crop} className="capitalize">
                        {crop.charAt(0).toUpperCase() + crop.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current NPK Values */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Current Soil Nutrients (mg/kg)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                    <Input
                      id="nitrogen"
                      type="number"
                      placeholder="Current N"
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
                      placeholder="Current P"
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
                      placeholder="Current K"
                      value={formData.potassium}
                      onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !formData.crop}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Beaker className="w-4 h-4 mr-2" />
                    Get Fertilizer Recommendation
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Card */}
        {result && (
          <Card className="mt-6 shadow-card border-2 border-secondary/50 animate-scale-in">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl">Fertilizer Recommendation</CardTitle>
                  <CardDescription>Optimized for your soil conditions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-accent rounded-xl p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Recommended Fertilizer</p>
                    <p className="text-2xl font-serif font-bold text-foreground">{result.fertilizer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="text-2xl font-bold text-primary">{result.quantity} kg/acre</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-foreground mb-2">Application Schedule</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{result.schedule}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Analysis & Additional Recommendations</h4>
                <ul className="space-y-2">
                  {result.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {detail}
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
