import React, { useState } from 'react';
import {  ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';

interface AuthScreenProps {
  onAuth: () => void;
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOTP = () => {
    if (phone) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      onAuth();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-2">
            <span className="text-4xl">🚗</span>
          </div>
          <div>
            <h1 className="text-5xl font-bold text-primary mb-2">
              HopOn
            </h1>
            <p className="text-lg text-gray-600">Your trusted carpooling community</p>
          </div>
        </div>

        <Card className="border-2 border-gray-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {step === 'phone' ? 'Welcome!' : 'Verify your number'}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 'phone' 
                ? 'Enter your phone number to get started' 
                : `We sent a code to ${phone}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 'phone' ? (
              <>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-base">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+976 9999 9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-14 text-base border-gray-300"
                  />
                </div>
                <Button 
                  onClick={handleSendOTP}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-full text-lg"
                  disabled={!phone}
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <Label className="text-base">Enter 6-digit code</Label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <Button 
                  onClick={handleVerifyOTP}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-full text-lg"
                  disabled={otp.length !== 6}
                >
                  Verify & Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  onClick={() => setStep('phone')}
                  variant="ghost"
                  className="w-full"
                >
                  Change phone number
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}