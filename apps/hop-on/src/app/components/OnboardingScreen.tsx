import React, { useState } from 'react';
import { Car, CircleUser, Upload, Camera, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface OnboardingScreenProps {
  onComplete: (role: 'driver' | 'passenger') => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'driver' | 'passenger' | null>(null);
  const [name, setName] = useState('');

  const handleRoleSelect = (selectedRole: 'driver' | 'passenger') => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleComplete = () => {
    if (role && name) {
      onComplete(role);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-3xl mx-auto pt-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-3">
            <span className="text-3xl">🚗</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">HopOn</h1>
        </div>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span>Step {step} of 3</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-white" />
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold">Welcome!</h2>
              <p className="text-lg text-gray-600">How would you like to use HopOn?</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] border-2 hover:border-primary bg-white"
                onClick={() => handleRoleSelect('driver')}
              >
                <CardContent className="p-8 text-center space-y-6">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                    <Car className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Driver</h3>
                    <p className="text-gray-600">
                      Share your journey and earn money on your commute
                    </p>
                  </div>
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Earn from empty seats</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Travel with company</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] border-2 hover:border-primary bg-white"
                onClick={() => handleRoleSelect('passenger')}
              >
                <CardContent className="p-8 text-center space-y-6">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                    <CircleUser className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Passenger</h3>
                    <p className="text-gray-600">
                      Find affordable rides with trusted drivers
                    </p>
                  </div>
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Save on travel costs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Meet new people</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Profile Info */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold">Create your profile</h2>
              <p className="text-lg text-gray-600">Tell us a bit about yourself</p>
            </div>

            <Card className="border-2 border-gray-200 bg-white">
              <CardContent className="p-8 space-y-8">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                    <Button 
                      size="sm" 
                      className="absolute bottom-2 right-2 rounded-full w-10 h-10 p-0 bg-primary hover:bg-primary/90"
                    >
                      <Upload className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base">Full Name</Label>
                  <Input 
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-base border-gray-300"
                  />
                  <p className="text-sm text-gray-500">This is how other members will see you</p>
                </div>

                <Button 
                  onClick={() => setStep(3)}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-full text-lg"
                  disabled={!name}
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Verification */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold">Verify your identity</h2>
              <p className="text-lg text-gray-600">Build trust in our community</p>
            </div>

            <Card className="border-2 border-gray-200 bg-white">
              <CardContent className="p-8 space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center space-y-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Upload ID document</h3>
                    <p className="text-sm text-gray-600">
                      National ID, passport or driver's license
                    </p>
                  </div>
                  <Button variant="outline" className="rounded-full">Choose file</Button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center space-y-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Take a selfie</h3>
                    <p className="text-sm text-gray-600">
                      For identity verification
                    </p>
                  </div>
                  <Button variant="outline" className="rounded-full">Open camera</Button>
                </div>

                <div className="pt-6 space-y-3">
                  <Button 
                    onClick={handleComplete}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-full text-lg"
                  >
                    Complete setup
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    onClick={handleComplete}
                    variant="ghost"
                    className="w-full"
                  >
                    I'll do this later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}