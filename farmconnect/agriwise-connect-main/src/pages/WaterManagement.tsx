import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Droplets, ThermometerSun, Wind, AlertTriangle, CheckCircle } from 'lucide-react';

export default function WaterManagement() {
  const [moistureLevel, setMoistureLevel] = useState(45);
  const [temperature, setTemperature] = useState(28);
  const [humidity, setHumidity] = useState(65);

  const getIrrigationStatus = () => {
    if (moistureLevel < 30) {
      return { status: 'critical', message: 'Irrigation Required Immediately', color: 'text-destructive', bg: 'bg-destructive/10' };
    } else if (moistureLevel < 50) {
      return { status: 'warning', message: 'Irrigation Recommended Soon', color: 'text-secondary-foreground', bg: 'bg-secondary/20' };
    } else if (moistureLevel > 80) {
      return { status: 'excess', message: 'Excess Moisture - Stop Irrigation', color: 'text-agri-water', bg: 'bg-agri-water/10' };
    } else {
      return { status: 'optimal', message: 'Moisture Level Optimal', color: 'text-primary', bg: 'bg-primary/10' };
    }
  };

  const irrigationStatus = getIrrigationStatus();

  const getMoistureColor = () => {
    if (moistureLevel < 30) return 'bg-destructive';
    if (moistureLevel < 50) return 'bg-secondary';
    if (moistureLevel > 80) return 'bg-agri-water';
    return 'bg-primary';
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
              <div className="w-10 h-10 bg-agri-water/10 rounded-xl flex items-center justify-center">
                <Droplets className="w-6 h-6 text-agri-water" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold text-foreground">Water Management</h1>
                <p className="text-xs text-muted-foreground">Smart irrigation monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Status Card */}
        <Card className={`mb-8 shadow-card ${irrigationStatus.bg}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {irrigationStatus.status === 'optimal' ? (
                <CheckCircle className={`w-12 h-12 ${irrigationStatus.color}`} />
              ) : (
                <AlertTriangle className={`w-12 h-12 ${irrigationStatus.color}`} />
              )}
              <div>
                <h2 className={`text-2xl font-serif font-bold ${irrigationStatus.color}`}>
                  {irrigationStatus.message}
                </h2>
                <p className="text-muted-foreground">
                  Current soil moisture: {moistureLevel}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Moisture Gauge */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Droplets className="w-5 h-5 text-agri-water" />
                Soil Moisture Level
              </CardTitle>
              <CardDescription>Optimal range: 50-80%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative pt-2">
                  <Progress value={moistureLevel} className={`h-4 ${getMoistureColor()}`} />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>Dry</span>
                    <span>Optimal</span>
                    <span>Wet</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-5xl font-bold text-foreground">{moistureLevel}%</span>
                </div>
                <div className="space-y-2">
                  <Label>Simulate Moisture Level</Label>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={moistureLevel}
                    onChange={(e) => setMoistureLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Conditions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-serif">Environmental Conditions</CardTitle>
              <CardDescription>Current weather affecting irrigation needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-accent rounded-xl">
                  <div className="flex items-center gap-3">
                    <ThermometerSun className="w-8 h-8 text-agri-sun" />
                    <div>
                      <p className="text-sm text-muted-foreground">Temperature</p>
                      <p className="text-2xl font-bold text-foreground">{temperature}°C</p>
                    </div>
                  </div>
                  <Input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-accent rounded-xl">
                  <div className="flex items-center gap-3">
                    <Wind className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Humidity</p>
                      <p className="text-2xl font-bold text-foreground">{humidity}%</p>
                    </div>
                  </div>
                  <Input
                    type="number"
                    value={humidity}
                    onChange={(e) => setHumidity(parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="mt-6 shadow-card">
          <CardHeader>
            <CardTitle className="font-serif">Irrigation Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-accent rounded-xl">
                <h4 className="font-medium text-foreground mb-2">Best Time to Irrigate</h4>
                <p className="text-sm text-muted-foreground">
                  {temperature > 30 ? 'Early morning (5-7 AM) or evening (5-7 PM)' : 'Morning hours (6-10 AM)'}
                </p>
              </div>
              <div className="p-4 bg-accent rounded-xl">
                <h4 className="font-medium text-foreground mb-2">Water Quantity</h4>
                <p className="text-sm text-muted-foreground">
                  {moistureLevel < 30 ? 'Heavy irrigation (50-60 mm)' : 
                   moistureLevel < 50 ? 'Medium irrigation (30-40 mm)' : 
                   'Light irrigation (10-20 mm) or none'}
                </p>
              </div>
              <div className="p-4 bg-accent rounded-xl">
                <h4 className="font-medium text-foreground mb-2">Next Irrigation</h4>
                <p className="text-sm text-muted-foreground">
                  {moistureLevel < 30 ? 'Immediately required' : 
                   moistureLevel < 50 ? 'Within 24-48 hours' : 
                   'In 3-5 days (monitor levels)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
