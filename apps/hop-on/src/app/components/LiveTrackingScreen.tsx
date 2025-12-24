import React, { useState } from 'react';
import {  Phone, MessageCircle, TriangleAlert, Share2, Clock, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface LiveTrackingScreenProps {
  onBack: () => void;
  onSOS: () => void;
}

export function LiveTrackingScreen({ onBack, onSOS }: LiveTrackingScreenProps) {
  const [tripProgress] = useState(45);
  const driverName = 'Batmunkh';
  const eta = '15 min';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Map Area */}
      <div className="relative h-[60vh] bg-gradient-to-br from-blue-50 to-green-50">
        {/* Map pattern background */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tracking-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e40af" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tracking-grid)" />
          </svg>
        </div>

        {/* Animated route */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="90%" height="80%" viewBox="0 0 300 300">
            {/* Route path */}
            <path
              d="M 50 250 L 150 150 L 250 50"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeDasharray="10,5"
            />
            
            {/* Start point */}
            <circle cx="50" cy="250" r="12" fill="#10b981" stroke="white" strokeWidth="3"/>
            
            {/* End point */}
            <circle cx="250" cy="50" r="12" fill="#ef4444" stroke="white" strokeWidth="3"/>
            
            {/* Moving car (driver location) */}
            <g transform="translate(150, 150)">
              <circle r="20" fill="#3b82f6" opacity="0.2" className="animate-pulse"/>
              <circle r="12" fill="#3b82f6" stroke="white" strokeWidth="3"/>
              <text x="0" y="5" fontSize="12" textAnchor="middle" fill="white">🚗</text>
            </g>
          </svg>
        </div>

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onBack}
            className="bg-white shadow-lg"
          >
            ← Back
          </Button>
        </div>

        {/* Share trip button */}
        <div className="absolute top-4 right-4">
          <Button 
            variant="secondary" 
            size="sm"
            className="bg-white shadow-lg"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Trip
          </Button>
        </div>

        {/* SOS Button */}
        <div className="absolute bottom-6 right-6">
          <Button
            onClick={onSOS}
            size="lg"
            className="bg-red-600 hover:bg-red-700 rounded-full w-16 h-16 p-0 shadow-2xl animate-pulse"
          >
            <TriangleAlert className="w-8 h-8" />
          </Button>
        </div>

        {/* ETA Card */}
        <div className="absolute bottom-6 left-6">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <span>Estimated arrival</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{eta}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trip Info Panel */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Driver Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14 border-2 border-blue-100">
                  <AvatarImage src="https://images.unsplash.com/photo-1758525747638-25563afc9ff5?w=200" />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{driverName}</h3>
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">White Toyota Camry</p>
                  <p className="text-sm text-gray-500">99 UB 1234</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <MessageCircle className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Trip Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Trip Progress</span>
                <span className="font-medium">{tripProgress}%</span>
              </div>
              <Progress value={tripProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Route Details */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium mb-3">Route Details</h3>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Pickup</p>
                <p className="font-medium">Sukhbaatar Square</p>
                <p className="text-sm text-gray-500">Completed at 8:00 AM</p>
              </div>
            </div>

            <div className="h-8 border-l-2 border-dashed border-gray-300 ml-3"></div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Destination</p>
                <p className="font-medium">Zaisan Memorial</p>
                <p className="text-sm text-gray-500">ETA: 8:{eta}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                🛡️
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">Your Safety Matters</h4>
                <p className="text-sm text-gray-700">
                  Trip is being monitored. Press the SOS button if you need emergency assistance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}