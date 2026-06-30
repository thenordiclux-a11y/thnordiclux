'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  MousePointerClick,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Search,
  Copy,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAffiliate } from '../../contexts/AffiliateContext';
import { useData } from '../../contexts/DataContext';
import { AffiliateSharePanel } from '../../components/AffiliateSharePanel';
import { buildAffiliateLink, getRecommendedProducts } from '../../lib/affiliate-utils';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

export default function AffiliateDashboardPage() {
  const { member, clicks, referrals, affiliates } = useAffiliate();
  const { products } = useData();
  const [search, setSearch] = useState('');

  const currentAff = affiliates.find((a) => a.id === member?.id);

  const myClicks = useMemo(
    () => clicks.filter((c) => c.affiliateId === member?.id),
    [clicks, member?.id]
  );
  const myReferrals = useMemo(
    () => referrals.filter((r) => r.affiliateId === member?.id),
    [referrals, member?.id]
  );

  const recommended = useMemo(() => getRecommendedProducts(products, 6), [products]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products.filter((p) => p.stock > 0);
    return products.filter(
      (p) =>
        p.stock > 0 &&
        (p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q))
    );
  }, [products, search]);

  const shopLink = member ? buildAffiliateLink(member.affiliateCode, '/shop') : '';

  const copyShopLink = async () => {
    if (!shopLink) return;
    await navigator.clipboard.writeText(shopLink);
    toast.success('Main shop affiliate link copied!');
  };

  const stats = [
    {
      label: 'Total clicks',
      value: currentAff?.totalClicks ?? myClicks.length,
      icon: MousePointerClick,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Conversions',
      value: currentAff?.totalConversions ?? myReferrals.length,
      icon: ShoppingBag,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Pending earnings',
      value: `$${(currentAff?.pendingEarnings ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Total earned',
      value: `$${(currentAff?.totalEarnings ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-violet-600 bg-violet-50',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {member?.name}</h1>
        <p className="text-gray-500 mt-1">
          Share products and earn {member?.commissionRate}% on every sale through your links.
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Your main affiliate link</h2>
        <p className="text-xs text-gray-500 mb-3">
          Share this link anywhere — social media, blog, email — to earn on any purchase.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            value={shopLink}
            className="flex-1 text-sm bg-gray-50 border rounded-lg px-3 py-2 font-mono truncate"
          />
          <Button onClick={copyShopLink} variant="outline" className="gap-2 shrink-0">
            <Copy className="w-4 h-4" />
            Copy shop link
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Code: <span className="font-mono font-medium text-gray-600">{member?.affiliateCode}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border shadow-sm p-4">
              <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <section id="recommendations">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Recommended to promote</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Top-rated products our team recommends for affiliates — great for social posts.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommended.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col"
            >
              <div className="relative aspect-square bg-gray-50">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {product.badge && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-xs text-gray-500">{product.category}</p>
                <h3 className="font-medium text-gray-900 line-clamp-2 mt-0.5">{product.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-gray-900">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                  )}
                </div>
                <div className="mt-auto pt-4">
                  {member && (
                    <AffiliateSharePanel
                      product={product}
                      affiliateCode={member.affiliateCode}
                      compact
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {recommended.length === 0 && (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-6 text-center">
            No products available yet. Check back when the catalog is updated.
          </p>
        )}
      </section>

      <section id="products">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">All products to promote</h2>
        <p className="text-sm text-gray-500 mb-4">
          Browse the full catalog and share individual product links on social media.
        </p>
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border shadow-sm p-4 flex flex-col sm:flex-row gap-4"
            >
              <div className="relative w-full sm:w-24 h-24 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                  sizes="96px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {product.brand ? `${product.brand} · ` : ''}
                      {product.category} · ${product.price}
                    </p>
                  </div>
                  <a
                    href={member ? buildAffiliateLink(member.affiliateCode, '/shop', product.id) : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline shrink-0"
                  >
                    Preview link
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {member && (
                  <div className="mt-3">
                    <AffiliateSharePanel product={product} affiliateCode={member.affiliateCode} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">No products match your search.</p>
        )}
      </section>

      <section id="earnings">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent conversions</h2>
        {myReferrals.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No conversions yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Start sharing your links on social media to earn commissions!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Sale</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Commission</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {myReferrals.map((ref) => (
                  <tr key={ref.id}>
                    <td className="px-4 py-3 font-mono text-xs">{ref.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">${ref.orderTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                      +${ref.commission.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          ref.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : ref.status === 'approved'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {ref.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
