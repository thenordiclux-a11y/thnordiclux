'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAffiliate } from '../../contexts/AffiliateContext';
import { Share2, ArrowLeft } from 'lucide-react';
import logo from '../../assets/4cb21529e27325b99c96e06426397bce92267e6c.png';

export default function AffiliateLoginPage() {
  const router = useRouter();
  const { login, settings } = useAffiliate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      router.push('/affiliate/dashboard');
    } else {
      setError('Invalid credentials or account not active. Contact admin for access.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to store
          </Link>
          <div className="flex justify-center mb-4">
            <Image src={logo} alt="Nordic Lux" width={64} height={64} className="h-16 w-16" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-sm mb-3">
            <Share2 className="w-4 h-4" />
            Affiliate Program
          </div>
          <h1 className="text-2xl font-bold text-white">{settings.programName}</h1>
          <p className="text-blue-200/80 text-sm mt-2 max-w-sm mx-auto">{settings.programDescription}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Member login</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to access your affiliate dashboard and share products.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to dashboard'}
            </Button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Not a member yet? Ask your Nordic Lux admin to create your affiliate account.
          </p>
        </div>
      </div>
    </div>
  );
}
