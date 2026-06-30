'use client'
import { useState } from 'react';
import { useData, type SEO } from '../../contexts/DataContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Edit } from 'lucide-react';
import { Textarea } from '../../components/ui/textarea';

export default function SEO() {
  const { seo, updateSEO } = useData();
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    ogImage: '',
  });

  const commonPages = [
    { page: 'home', label: 'Home Page' },
    { page: 'products', label: 'Products Page' },
    { page: 'categories', label: 'Categories Page' },
    { page: 'about', label: 'About Page' },
    { page: 'contact', label: 'Contact Page' },
  ];

  const handleEdit = (page: string) => {
    const existing = seo.find((s) => s.page === page);
    setFormData({
      title: existing?.title || '',
      description: existing?.description || '',
      keywords: existing?.keywords || '',
      ogImage: existing?.ogImage || '',
    });
    setEditingPage(page);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPage) {
      updateSEO(editingPage, formData);
      setEditingPage(null);
    }
  };

  const getSEOForPage = (page: string): SEO | undefined => {
    return seo.find((s) => s.page === page);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">SEO Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Optimize your pages for search engines</p>
      </div>

      {/* SEO Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commonPages.map((pageInfo) => {
                const pageSEO = getSEOForPage(pageInfo.page);
                return (
                  <TableRow key={pageInfo.page}>
                    <TableCell className="font-medium">{pageInfo.label}</TableCell>
                    <TableCell className="max-w-xs truncate">{pageSEO?.title || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {pageSEO?.description || '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {pageSEO?.keywords || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {pageSEO?.updatedAt
                        ? new Date(pageSEO.updatedAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(pageInfo.page)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit SEO - {commonPages.find((p) => p.page === editingPage)?.label}
            </DialogTitle>
            <DialogDescription>
              Optimize this page for search engines and social media
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter page title (50-60 characters recommended)"
                maxLength={60}
                required
              />
              <p className="text-xs text-gray-500">{formData.title.length}/60 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Meta Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter meta description (150-160 characters recommended)"
                maxLength={160}
                rows={3}
                required
              />
              <p className="text-xs text-gray-500">{formData.description.length}/160 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="beauty, skincare, cosmetics (comma separated)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogImage">Open Graph Image URL</Label>
              <Input
                id="ogImage"
                type="url"
                value={formData.ogImage}
                onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500">
                Image for social media sharing (1200x630px recommended)
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingPage(null)}>
                Cancel
              </Button>
              <Button type="submit">Save SEO Settings</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

