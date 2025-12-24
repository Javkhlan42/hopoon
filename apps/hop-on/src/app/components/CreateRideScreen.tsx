import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Users, ArrowRight, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapView } from './MapView';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';

interface CreateRideScreenProps {
  onBack: () => void;
  onCreateRide: () => void;
}

export function CreateRideScreen({ onBack, onCreateRide }: CreateRideScreenProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState(3);
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');

  const handleCreate = () => {
    // Validation would go here
    onCreateRide();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-xl">🚗</span>
              </div>
              <h1 className="text-2xl font-bold">Publish a ride</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 py-8 space-y-6">
        {/* Route Section */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">Where are you going?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="from">Leaving from</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <Input
                  id="from"
                  placeholder="City, town or address"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="pl-12 h-14 text-base border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="to">Going to</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
                <Input
                  id="to"
                  placeholder="City, town or address"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-12 h-14 text-base border-gray-300"
                />
              </div>
            </div>

            {from && to && (
              <div className="pt-4 rounded-lg overflow-hidden border border-gray-200">
                <MapView 
                  height="200px" 
                  showRoute 
                  pickupLocation={from}
                  dropoffLocation={to}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule Section */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">When?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-12 h-14 border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="time">Departure time</Label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-12 h-14 border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div>
                <p className="font-medium">Recurring ride</p>
                <p className="text-sm text-gray-600">Repeat this trip weekly</p>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Seats */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">Passengers & price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>How many passengers?</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  disabled={seats <= 1}
                  className="h-12 w-12 rounded-full"
                >
                  -
                </Button>
                <div className="flex items-center gap-3 min-w-[120px] justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                  <span className="text-3xl font-bold">{seats}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSeats(Math.min(5, seats + 1))}
                  disabled={seats >= 5}
                  className="h-12 w-12 rounded-full"
                >
                  +
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="price">Price per passenger</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₮</span>
                <Input
                  id="price"
                  type="number"
                  placeholder="5,000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-10 h-14 text-lg border-gray-300"
                />
              </div>
              <p className="text-sm text-gray-500">Recommended: ₮3,000 - ₮8,000 per seat</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes">Add details (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Example: No smoking, pets welcome, can pick up along the way..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="border-gray-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Price Summary */}
        {price && seats && (
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">You could earn</p>
                  <p className="text-4xl font-bold text-primary">
                    ₮{(parseInt(price) * seats).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    for this trip
                  </p>
                </div>
                <div className="text-5xl">💰</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <div className="pb-8">
          <Button
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-full text-lg"
            onClick={handleCreate}
            disabled={!from || !to || !date || !time || !price}
          >
            Publish ride
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}