import React from 'react';
import { Star,  Calendar, Users,  ArrowRight, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export interface Ride {
  id: string;
  driverName: string;
  driverPhoto: string;
  driverRating: number;
  verified: boolean;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  seatsAvailable: number;
  totalSeats: number;
  miniMapPreview?: boolean;
}

interface RideCardProps {
  ride: Ride;
  onJoinRide?: (rideId: string) => void;
  onChat?: (rideId: string) => void;
}

export function RideCard({ ride, onJoinRide, onChat }: RideCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all border border-gray-200">
      <CardContent className="p-6">
        <div className="grid md:grid-cols-[1fr_auto] gap-6">
          {/* Left side: Route and driver info */}
          <div className="space-y-4">
            {/* Route info - Horizontal layout like BlaBlaCar */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">{ride.time}</div>
                <div className="font-semibold text-lg">{ride.from}</div>
              </div>
              <div className="flex flex-col items-center px-4">
                <div className="w-16 h-0.5 bg-gray-300 relative">
                  <ArrowRight className="w-5 h-5 text-gray-400 absolute -top-2.5 right-0" />
                </div>
              </div>
              <div className="flex-1 text-right md:text-left">
                <div className="text-sm text-gray-500 mb-1">&nbsp;</div>
                <div className="font-semibold text-lg">{ride.to}</div>
              </div>
            </div>

            {/* Driver info */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <Avatar className="w-12 h-12">
                <AvatarImage src={ride.driverPhoto} alt={ride.driverName} />
                <AvatarFallback>{ride.driverName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{ride.driverName}</span>
                  {ride.verified && (
                    <CheckCircle className="w-4 h-4 text-primary fill-primary" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{ride.driverRating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ride.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Price and actions */}
          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6 border-gray-100">
            <div className="text-center md:text-right">
              <div className="text-2xl font-bold text-primary">₮{ride.price.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">per seat</div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-2 justify-center md:justify-end">
                <Users className="w-4 h-4" />
                <span>{ride.seatsAvailable} seat{ride.seatsAvailable !== 1 ? 's' : ''} left</span>
              </div>
            </div>
            <Button 
              onClick={() => onJoinRide?.(ride.id)}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
              disabled={ride.seatsAvailable === 0}
            >
              {ride.seatsAvailable === 0 ? 'Full' : 'Book'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}