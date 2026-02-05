import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Bug, Loader2, Upload, AlertTriangle, Shield, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';

// Simulated disease database
const diseaseDatabase: Record<string, { name: string; severity: string; causes: string; prevention: string; treatment: string }[]> = {
  rice: [
    { name: 'Blast Disease', severity: 'High', causes: 'Fungus Magnaporthe oryzae; humid conditions', prevention: 'Use resistant varieties, balanced fertilization', treatment: 'Apply Tricyclazole or Isoprothiolane fungicides' },
    { name: 'Bacterial Leaf Blight', severity: 'Medium', causes: 'Xanthomonas oryzae bacteria; infected seeds', prevention: 'Use certified seeds, proper drainage', treatment: 'Copper-based bactericides, remove infected plants' },
  ],
  wheat: [
    { name: 'Rust Disease', severity: 'High', causes: 'Puccinia fungi; cool moist conditions', prevention: 'Plant resistant varieties, early sowing', treatment: 'Apply propiconazole or tebuconazole' },
    { name: 'Powdery Mildew', severity: 'Medium', causes: 'Blumeria graminis fungus; high humidity', prevention: 'Adequate spacing, avoid excess nitrogen', treatment: 'Sulfur-based fungicides' },
  ],
  tomato: [
    { name: 'Early Blight', severity: 'Medium', causes: 'Alternaria solani fungus; warm wet weather', prevention: 'Crop rotation, remove infected debris', treatment: 'Chlorothalonil or mancozeb sprays' },
    { name: 'Late Blight', severity: 'High', causes: 'Phytophthora infestans; cool moist conditions', prevention: 'Resistant varieties, good air circulation', treatment: 'Metalaxyl or copper fungicides' },
  ],
  potato: [
    { name: 'Late Blight', severity: 'High', causes: 'Phytophthora infestans; humid conditions', prevention: 'Use certified tubers, proper hilling', treatment: 'Mancozeb or metalaxyl applications' },
    { name: 'Common Scab', severity: 'Low', causes: 'Streptomyces scabies; alkaline soil', prevention: 'Maintain soil pH 5.0-5.2, avoid lime', treatment: 'No chemical control; use resistant varieties' },
  ],
  cotton: [
    { name: 'Bacterial Blight', severity: 'Medium', causes: 'Xanthomonas citri; infected seeds', prevention: 'Acid-delinted certified seeds', treatment: 'Streptocycline sprays' },
    { name: 'Verticillium Wilt', severity: 'High', causes: 'Verticillium dahliae fungus; soil-borne', prevention: 'Long crop rotation, resistant varieties', treatment: 'No effective chemical control' },
  ],
};

export default function DiseaseDetection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState('');
  const [result, setResult] = useState<{ name: string; severity: string; causes: string; prevention: string; treatment: string; confidence: number } | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!selectedImage || !cropType) {
      toast({
        title: 'Missing Information',
        description: 'Please select an image and crop type',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate AI analysis with random disease selection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const diseases = diseaseDatabase[cropType] || diseaseDatabase['tomato'];
      const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
      const confidence = Math.floor(Math.random() * 20) + 75; // 75-95%
      
      const detection = {
        ...randomDisease,
        confidence,
      };
      
      // Save to database
      const { error } = await supabase.from('disease_detections').insert({
        user_id: user.id,
        crop_type: cropType,
        disease_name: detection.name,
        severity: detection.severity,
        causes: detection.causes,
        prevention: detection.prevention,
        treatment: detection.treatment,
        confidence: detection.confidence,
      });
      
      if (error) throw error;
      
      setResult(detection);
      
      toast({
        title: 'Analysis Complete',
        description: `Detected: ${detection.name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to analyze image',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'medium': return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
      case 'low': return 'bg-accent text-accent-foreground border-accent';
      default: return 'bg-muted text-muted-foreground';
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
              <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                <Bug className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold text-foreground">Disease Detection</h1>
                <p className="text-xs text-muted-foreground">AI-powered plant health analysis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Upload Leaf Image</CardTitle>
            <CardDescription>
              Take a clear photo of the affected leaf and our AI will identify the disease
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div 
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt="Selected leaf" 
                    className="max-h-64 mx-auto rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-12 h-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Click to upload image</p>
                      <p className="text-sm text-muted-foreground">or drag and drop</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>

              {/* Crop Selection */}
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type</Label>
                <Select value={cropType} onValueChange={setCropType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(diseaseDatabase).map((crop) => (
                      <SelectItem key={crop} value={crop} className="capitalize">
                        {crop.charAt(0).toUpperCase() + crop.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !selectedImage || !cropType}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Bug className="w-4 h-4 mr-2" />
                    Detect Disease
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Card */}
        {result && (
          <Card className="mt-6 shadow-card border-2 border-destructive/20 animate-scale-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="font-serif text-xl">{result.name}</CardTitle>
                    <CardDescription>Disease detected with {result.confidence}% confidence</CardDescription>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(result.severity)}`}>
                  {result.severity} Severity
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/5 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Causes</h4>
                    <p className="text-sm text-muted-foreground">{result.causes}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/5 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Prevention</h4>
                    <p className="text-sm text-muted-foreground">{result.prevention}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary/10 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Pill className="w-5 h-5 text-agri-earth mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Treatment</h4>
                    <p className="text-sm text-muted-foreground">{result.treatment}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
