'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAffiliate } from '../../contexts/AffiliateContext';
import type { AffiliateMember } from '../../lib/affiliate-types';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Share2,
  MousePointerClick,
  DollarSign,
  ExternalLink,
  Settings,
} from 'lucide-react';
import { buildAffiliateLink } from '../../lib/affiliate-utils';

export default function AdminAffiliatePage() {
  const {
    affiliates,
    referrals,
    settings,
    addAffiliate,
    updateAffiliate,
    deleteAffiliate,
    updateSettings,
  } = useAffiliate();

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editing, setEditing] = useState<AffiliateMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    commissionRate: settings.defaultCommissionRate,
    status: 'pending' as AffiliateMember['status'],
    phone: '',
    bio: '',
    instagram: '',
    facebook: '',
    tiktok: '',
  });
  const [settingsForm, setSettingsForm] = useState(settings);

  const filtered = affiliates.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClicks = affiliates.reduce((s, a) => s + a.totalClicks, 0);
  const totalConversions = affiliates.reduce((s, a) => s + a.totalConversions, 0);
  const totalPending = affiliates.reduce((s, a) => s + a.pendingEarnings, 0);

  const openDialog = (member?: AffiliateMember) => {
    if (member) {
      setEditing(member);
      setFormData({
        name: member.name,
        email: member.email,
        password: '',
        commissionRate: member.commissionRate,
        status: member.status,
        phone: member.phone || '',
        bio: member.bio || '',
        instagram: member.socialHandles?.instagram || '',
        facebook: member.socialHandles?.facebook || '',
        tiktok: member.socialHandles?.tiktok || '',
      });
    } else {
      setEditing(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        commissionRate: settings.defaultCommissionRate,
        status: 'pending',
        phone: '',
        bio: '',
        instagram: '',
        facebook: '',
        tiktok: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const socialHandles = {
      ...(formData.instagram && { instagram: formData.instagram }),
      ...(formData.facebook && { facebook: formData.facebook }),
      ...(formData.tiktok && { tiktok: formData.tiktok }),
    };

    if (editing) {
      updateAffiliate(editing.id, {
        name: formData.name,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
        commissionRate: formData.commissionRate,
        status: formData.status,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        socialHandles: Object.keys(socialHandles).length ? socialHandles : undefined,
      });
    } else {
      if (!formData.password) {
        toast.error('Password is required for new affiliates');
        return;
      }
      addAffiliate({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        commissionRate: formData.commissionRate,
        status: formData.status,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        socialHandles: Object.keys(socialHandles).length ? socialHandles : undefined,
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this affiliate member?')) deleteAffiliate(id);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Share2 className="w-7 h-7 text-blue-600" />
            Affiliate Program
          </h1>
          <p className="text-gray-500 mt-1">
            Manage affiliate members, commissions, and track promotions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => { setSettingsForm(settings); setIsSettingsOpen(true); }}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Link href="/affiliate/login" target="_blank">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Member portal
            </Button>
          </Link>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add affiliate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active members', value: affiliates.filter((a) => a.status === 'active').length, icon: Share2 },
          { label: 'Total clicks', value: totalClicks, icon: MousePointerClick },
          { label: 'Conversions', value: totalConversions, icon: DollarSign },
          { label: 'Pending payouts', value: `$${totalPending.toFixed(2)}`, icon: DollarSign },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border p-4 shadow-sm">
            <Icon className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-900">Affiliate members</h2>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search members…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="hidden md:table-cell">Commission</TableHead>
              <TableHead className="hidden sm:table-cell">Clicks</TableHead>
              <TableHead className="hidden sm:table-cell">Sales</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No affiliate members yet. Add your first member to get started.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{a.name}</p>
                      <p className="text-xs text-gray-500">{a.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{a.affiliateCode}</code>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{a.commissionRate}%</TableCell>
                  <TableCell className="hidden sm:table-cell">{a.totalClicks}</TableCell>
                  <TableCell className="hidden sm:table-cell">{a.totalConversions}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor(a.status)}`}>
                      {a.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(buildAffiliateLink(a.affiliateCode));
                          toast.success('Affiliate link copied');
                        }}
                        title="Copy link"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDialog(a)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {referrals.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Recent referrals ({referrals.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4">Affiliate</th>
                  <th className="pb-2 pr-4">Order</th>
                  <th className="pb-2 pr-4 text-right">Total</th>
                  <th className="pb-2 pr-4 text-right">Commission</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {referrals.slice(0, 10).map((r) => {
                  const aff = affiliates.find((a) => a.id === r.affiliateId);
                  return (
                    <tr key={r.id}>
                      <td className="py-2 pr-4">{aff?.name ?? r.affiliateCode}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{r.orderNumber}</td>
                      <td className="py-2 pr-4 text-right">${r.orderTotal.toFixed(2)}</td>
                      <td className="py-2 pr-4 text-right text-emerald-600">${r.commission.toFixed(2)}</td>
                      <td className="py-2 text-right capitalize">{r.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit affiliate' : 'Add affiliate member'}</DialogTitle>
            <DialogDescription>
              Members log in at /affiliate/login to promote products and share on social media.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div>
              <Label>{editing ? 'New password (leave blank to keep)' : 'Password'}</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editing} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Commission %</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as AffiliateMember['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <Label>Bio (optional)</Label>
              <Input value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Short description for their profile" />
            </div>
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Social handles (optional)</p>
              <div className="space-y-2">
                <Input placeholder="Instagram @handle" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} />
                <Input placeholder="Facebook profile URL" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} />
                <Input placeholder="TikTok @handle" value={formData.tiktok} onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })} />
              </div>
            </div>
            <Button type="submit" className="w-full">{editing ? 'Save changes' : 'Create affiliate'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Program settings</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateSettings(settingsForm);
              setIsSettingsOpen(false);
            }}
            className="space-y-4"
          >
            <div>
              <Label>Default commission rate (%)</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={settingsForm.defaultCommissionRate}
                onChange={(e) => setSettingsForm({ ...settingsForm, defaultCommissionRate: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Referral cookie duration (days)</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={settingsForm.cookieDays}
                onChange={(e) => setSettingsForm({ ...settingsForm, cookieDays: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Program name</Label>
              <Input value={settingsForm.programName} onChange={(e) => setSettingsForm({ ...settingsForm, programName: e.target.value })} />
            </div>
            <div>
              <Label>Program description</Label>
              <Input value={settingsForm.programDescription} onChange={(e) => setSettingsForm({ ...settingsForm, programDescription: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Save settings</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
