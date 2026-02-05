import { Card, CardContent } from '@/components/ui/card';
import { Sun, CloudRain } from 'lucide-react';

const weatherData = {
  temp: '28°C',
  condition: 'Partly Cloudy',
  humidity: '65%',
  rainfall: '2mm',
};

export function WeatherCard() {
  return (
    <Card className="bg-gradient-hero text-primary-foreground shadow-elevated">
      <CardContent className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-medium opacity-90 mb-1">Today's Weather</h3>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold">{weatherData.temp}</span>
              <div className="text-sm opacity-80">
                <p>{weatherData.condition}</p>
                <p>Humidity: {weatherData.humidity}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <Sun className="w-8 h-8 mb-1 mx-auto" />
              <p className="text-xs opacity-80">UV Index</p>
              <p className="font-semibold">Moderate</p>
            </div>
            <div className="text-center">
              <CloudRain className="w-8 h-8 mb-1 mx-auto" />
              <p className="text-xs opacity-80">Rainfall</p>
              <p className="font-semibold">{weatherData.rainfall}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
