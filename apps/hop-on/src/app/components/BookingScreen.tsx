import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Users, MessageSquare, Check, X, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import api from '../../lib/api';
import { toast } from 'sonner';

interface BookingScreenProps {
  onBack: () => void;
  onConfirm: () => void;
  rideId?: string;
}

export function BookingScreen({ onBack, onConfirm, rideId }: BookingScreenProps) {
  const [seats, setSeats] = useState(1);
  const [pickupNote, setPickupNote] = useState('');
  const [rideDetails, setRideDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const pricePerSeat = 5000;

  // Зорчилтын дэлгэрэнгүй мэдээлэл татах
  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
    }
  }, [rideId]);

  const fetchRideDetails = async () => {
    if (!rideId) return;
    
    try {
      const response = await api.rides.getById(rideId);
      if (response.success && response.data) {
        setRideDetails(response.data);
      }
    } catch (error) {
      console.error('Ride details fetch error:', error);
      toast.error('Зорчилтын мэдээлэл татахад алдаа гарлаа');
    }
  };

  const handleConfirmBooking = async () => {
    if (!rideId) {
      toast.error('Зорчилт сонгоогүй байна');
      return;
    }

    setLoading(true);
    try {
      const response = await api.bookings.create({
        rideId,
        seats,
      });

      if (response.success) {
        toast.success('Захиалга амжилттай үүслээ!');
        onConfirm();
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Захиалга үүсгэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-2xl font-bold">Complete booking</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 py-8 space-y-6">
        {/* Driver Info */}
        <Card className="border-2 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="https://images.unsplash.com/photo-1758525747638-25563afc9ff5?w=200" />
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">Batmunkh S.</h3>
                  <ShieldCheck className="w-5 h-5 text-primary fill-primary" />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.9</span>
                  </div>
                  <span>•</span>
                  <span>48 trips</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">White Toyota Camry • 99 UB 1234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Details */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">Trip details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Route */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <div className="w-0.5 h-8 bg-gray-300"></div>
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                </div>
                <div className="flex-1 space-y-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">08:00</p>
                    <p className="font-semibold text-lg">Sukhbaatar Square</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">08:30</p>
                    <p className="font-semibold text-lg">Zaisan Memorial</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Date */}
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">Monday, December 23, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seat Selection */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl">How many seats?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-gray-600" />
                <span className="text-lg">Passengers</span>
              </div>
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
                <span className="text-3xl font-bold min-w-[60px] text-center">{seats}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSeats(Math.min(3, seats + 1))}
                  disabled={seats >= 3}
                  className="h-12 w-12 rounded-full"
                >
                  +
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">3 seats available on this ride</p>
          </CardContent>
        </Card>

        {/* Pickup Note */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Message to driver (optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Example: I'll wait near the fountain, or I have one large suitcase..."
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
              rows={3}
              className="border-gray-300"
            />
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-2 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Instant booking</h4>
                <p className="text-sm text-gray-700">
                  This driver accepts bookings automatically. You'll receive a confirmation immediately after booking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Summary */}
        <Card className="border-2 border-primary bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between text-base">
              <span className="text-gray-600">Price per seat</span>
              <span className="font-medium">₮{pricePerSeat.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-base">
              <span className="text-gray-600">Passengers</span>
              <span className="font-medium">× {seats}</span>
            </div>
            <Separator className="bg-primary/20" />
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">Total price</span>
              <span className="text-4xl font-bold text-primary">
                ₮{(pricePerSeat * seats).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="pb-8">
          <Button
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-full text-lg"
            onClick={handleConfirmBooking}
            disabled={loading}
          >
            {loading ? 'Уншиж байна...' : 'Confirm booking'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}