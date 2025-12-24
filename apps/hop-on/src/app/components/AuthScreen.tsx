'use client';

import React, { useState } from 'react';
import {  ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { apiClient } from '../../lib/api';
import { toast } from 'sonner';

interface AuthScreenProps {
  onAuth: () => void;
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [step, setStep] = useState<'register' | 'login' | 'otp'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!phone || !password || !name) {
      toast.error('Утасны дугаар, нууц үг болон нэрээ оруулна уу');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.auth.register({
        phone,
        password,
        name,
        ...(email && { email }),
      });

      // Save tokens
      if (response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        toast.success('Амжилттай бүртгэгдлээ!');
        onAuth();
      }
    } catch (error: any) {
      toast.error(error.message || 'Бүртгэл амжилтгүй боллоо');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      toast.error('Утасны дугаар болон нууц үгээ оруулна уу');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.auth.login(phone, password);

      // Save tokens
      if (response.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        toast.success('Амжилттай нэвтэрлээ!');
        onAuth();
      }
    } catch (error: any) {
      toast.error(error.message || 'Нэвтрэлт амжилтгүй боллоо');
    } finally {
      setLoading(false);
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
              {step === 'register' ? 'Бүртгүүлэх' : step === 'login' ? 'Нэвтрэх' : 'Баталгаажуулах'}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 'register' 
                ? 'Шинэ хэрэглэгч үүсгэх' 
                : step === 'login'
                ? 'Өөрийн бүртгэлээр нэвтрэх'
                : `Код илгээсэн: ${phone}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 'register' ? (
              <>
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base">Нэр</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Таны нэр"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-base border-gray-300"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-base">Утасны дугаар</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+97699887766"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-14 text-base border-gray-300"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base">И-мэйл (заавал биш)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 text-base border-gray-300"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-base">Нууц үг</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Нууц үгээ оруулна уу"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 text-base border-gray-300"
                  />
                </div>
                <Button 
                  onClick={handleRegister}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-full text-lg"
                  disabled={!phone || !password || !name || loading}
                >
                  {loading ? 'Уншиж байна...' : 'Бүртгүүлэх'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  onClick={() => setStep('login')}
                  variant="ghost"
                  className="w-full"
                >
                  Бүртгэлтэй юу? Нэвтрэх
                </Button>
              </>
            ) : step === 'login' ? (
              <>
                <div className="space-y-3">
                  <Label htmlFor="phone-login" className="text-base">Утасны дугаар</Label>
                  <Input
                    id="phone-login"
                    type="tel"
                    placeholder="+97699887766"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-14 text-base border-gray-300"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password-login" className="text-base">Нууц үг</Label>
                  <Input
                    id="password-login"
                    type="password"
                    placeholder="Нууц үгээ оруулна уу"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 text-base border-gray-300"
                  />
                </div>
                <Button 
                  onClick={handleLogin}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-full text-lg"
                  disabled={!phone || !password || loading}
                >
                  {loading ? 'Уншиж байна...' : 'Нэвтрэх'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  onClick={() => setStep('register')}
                  variant="ghost"
                  className="w-full"
                >
                  Шинэ хэрэглэгч үү? Бүртгүүлэх
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
                  onClick={onAuth}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-full text-lg"
                  disabled={otp.length !== 6}
                >
                  Баталгаажуулах
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  onClick={() => setStep('register')}
                  variant="ghost"
                  className="w-full"
                >
                  Буцах
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