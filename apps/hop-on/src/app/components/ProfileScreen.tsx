import React from 'react';
import { Star, Shield, MapPin,  Settings, ChevronRight, Car, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent,  } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ProfileScreenProps {
  onBack: () => void;
}

const pastTrips = [
  {
    id: '1',
    type: 'driver',
    route: 'Sukhbaatar Square → Zaisan Memorial',
    date: 'Dec 20, 2024',
    passengers: 3,
    earnings: 15000,
  },
  {
    id: '2',
    type: 'passenger',
    route: 'Peace Avenue → Airport',
    date: 'Dec 18, 2024',
    cost: 12000,
  },
  {
    id: '3',
    type: 'driver',
    route: 'State Dept Store → Naran Tuul',
    date: 'Dec 15, 2024',
    passengers: 2,
    earnings: 6000,
  },
];

const reviews = [
  {
    id: '1',
    author: 'Batmunkh',
    rating: 5,
    comment: 'Great driver! Very punctual and friendly.',
    date: 'Dec 20, 2024',
  },
  {
    id: '2',
    author: 'Oyunaa',
    rating: 5,
    comment: 'Clean car and smooth ride. Highly recommend!',
    date: 'Dec 18, 2024',
  },
  {
    id: '3',
    author: 'Dorj',
    rating: 4,
    comment: 'Good experience overall.',
    date: 'Dec 15, 2024',
  },
];

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto p-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-white hover:bg-white/20 mb-4"
          >
            ← Back
          </Button>

          {/* Profile Info */}
          <div className="flex items-start gap-4 pb-6">
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarImage src="https://images.unsplash.com/photo-1758525747638-25563afc9ff5?w=200" />
              <AvatarFallback>TB</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Temuujin Bat</h1>
                <Badge className="bg-green-500 hover:bg-green-600">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
              
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold">4.8</span>
                <span className="text-white/80 ml-1">(24 reviews)</span>
              </div>
              
              <p className="text-white/90">Member since Dec 2023</p>
            </div>

            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">48</div>
              <div className="text-sm text-white/80">Total Trips</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">32</div>
              <div className="text-sm text-white/80">As Driver</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">16</div>
              <div className="text-sm text-white/80">As Passenger</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Verification Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Verification Complete</p>
                  <p className="text-sm text-gray-600">Phone & ID verified</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="trips" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trips">Trip History</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* Trip History */}
          <TabsContent value="trips" className="space-y-3">
            {pastTrips.map((trip) => (
              <Card key={trip.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        trip.type === 'driver' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {trip.type === 'driver' ? (
                          <Car className="w-4 h-4 text-blue-600" />
                        ) : (
                          <MapPin className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <Badge variant={trip.type === 'driver' ? 'default' : 'secondary'}>
                        {trip.type === 'driver' ? 'Driver' : 'Passenger'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      {trip.type === 'driver' ? (
                        <>
                          <div className="font-bold text-green-600">+₮{trip.earnings}</div>
                          <div className="text-xs text-gray-500">{trip.passengers} passengers</div>
                        </>
                      ) : (
                        <div className="font-bold text-gray-600">₮{trip.cost}</div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">{trip.route}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {trip.date}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="space-y-3">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.author}</p>
                        <p className="text-sm text-gray-600">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
