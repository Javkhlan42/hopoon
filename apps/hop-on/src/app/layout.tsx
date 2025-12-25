import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { DialogProvider } from '../components/DialogProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HopOn - Ride Sharing',
  description: 'Social ride-sharing platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body className={inter.className}>
        <AuthProvider>
          <DialogProvider>{children}</DialogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
