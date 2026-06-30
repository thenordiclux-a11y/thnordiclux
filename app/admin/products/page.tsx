'use client'
import { useState, useRef, useEffect, useMemo } from 'react';
import { useData, Product } from '../../contexts/DataContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search, Upload, FileSpreadsheet, FileText, AlertCircle, CheckCircle2, Image as ImageIcon, Download, FileJson, CloudUpload, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '../../components/ui/textarea';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { SHOP_CATEGORY_SUGGESTIONS } from '../../lib/shop-filter-constants';
import { collectShopSpecificationTags, getProductSpecificationTags } from '../../lib/product-specification-tags';

const CATEGORY_DATALIST_ID = 'admin-product-categories';
const SPEC_TAG_DATALIST_ID = 'admin-product-spec-tags';

function parseSpecificationTagsCell(raw: string): string[] | undefined {
  const s = raw.trim();
  if (!s) return undefined;
  const parts = s.split(/[,;|]/).map((t) => t.trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of parts) {
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out.length ? out : undefined;
}

function specificationTagsFromImportedRecord(product: Record<string, unknown>): string[] | undefined {
  const parts: string[] = [];
  const pushParsed = (v: unknown) => {
    if (Array.isArray(v)) {
      v.forEach((x) => {
        if (typeof x === 'string' && x.trim()) parts.push(x.trim());
      });
    } else if (typeof v === 'string') {
      const p = parseSpecificationTagsCell(v);
      if (p) parts.push(...p);
    }
  };
  pushParsed(product.specificationTags);
  pushParsed(product.skinConcerns);
  if (parts.length === 0) return undefined;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of parts) {
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

export default function Products() {
  const { products, productsLoading, addProduct, addProducts, updateProduct, deleteProduct, syncLocalProductsToSupabase, categories } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [productsPage, setProductsPage] = useState(1);
  const [productsPageSize, setProductsPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isJsonImportDialogOpen, setIsJsonImportDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    success: number;
    errors: Array<{ row: number; message: string }>;
  } | null>(null);
  const [jsonImportStatus, setJsonImportStatus] = useState<{
    success: boolean;
    message: string;
    imported: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const additionalImageUploadRef = useRef<HTMLInputElement>(null);
  const [additionalImageUploadIndex, setAdditionalImageUploadIndex] = useState<number | null>(null);
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    originalPrice: '',
    image: '',
    additionalImages: [] as string[],
    additionalImageModes: [] as ('url' | 'upload')[],
    description: '',
    stock: '',
    sku: '',
    type: '',
    rating: '5',
    country: 'USA',
    reviews: '0',
    /** Shop filters & product cards — any labels you need per product. */
    specificationTags: [] as string[],
  });
  const [autoGenerateSku, setAutoGenerateSku] = useState(true);
  const [syncingToSupabase, setSyncingToSupabase] = useState(false);
  const [specTagDraft, setSpecTagDraft] = useState('');

  const specificationTagSuggestions = useMemo(
    () => collectShopSpecificationTags(products),
    [products]
  );

  const sortedAdminCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const categoryNameMatchesAdmin = (name: string) =>
    sortedAdminCategories.some(
      (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()
    );

  const categorySuggestionList = useMemo(() => {
    const set = new Set<string>();
    SHOP_CATEGORY_SUGGESTIONS.forEach((c) => set.add(c));
    categories.forEach((c) => set.add(c.name));
    products.forEach((p) => {
      if (p.category?.trim()) set.add(p.category.trim());
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [categories, products]);

  const addSpecificationTagFromDraft = () => {
    const raw = specTagDraft.trim();
    if (!raw) return;
    setFormData((prev) => {
      const lower = new Set(prev.specificationTags.map((t) => t.toLowerCase()));
      if (lower.has(raw.toLowerCase())) return prev;
      return { ...prev, specificationTags: [...prev.specificationTags, raw] };
    });
    setSpecTagDraft('');
  };

  const removeSpecificationTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      specificationTags: prev.specificationTags.filter((t) => t !== tag),
    }));
  };

  const togglePresetSpecificationTag = (preset: string) => {
    setFormData((prev) => {
      const idx = prev.specificationTags.findIndex((t) => t.toLowerCase() === preset.toLowerCase());
      if (idx >= 0) {
        return {
          ...prev,
          specificationTags: prev.specificationTags.filter((_, i) => i !== idx),
        };
      }
      return { ...prev, specificationTags: [...prev.specificationTags, preset] };
    });
  };

  const handleSyncLocalToSupabase = async () => {
    setSyncingToSupabase(true);
    try {
      const result = await syncLocalProductsToSupabase();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          result.synced > 0
            ? `Synced ${result.synced} product(s) to Supabase.${result.skipped ? ` ${result.skipped} already existed (skipped).` : ''}`
            : result.skipped > 0
              ? `All ${result.skipped} local product(s) already in Supabase.`
              : 'No local products to sync.'
        );
      }
    } finally {
      setSyncingToSupabase(false);
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return true;
        const tagMatch = getProductSpecificationTags(p).some((t) => t.toLowerCase().includes(q));
        return (
          p.name.toLowerCase().includes(q) ||
          !!p.brand?.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          tagMatch
        );
      }),
    [products, searchTerm]
  );

  const productsTotalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPageSize));
  const paginatedProducts = useMemo(() => {
    const page = Math.min(productsPage, productsTotalPages);
    const start = (page - 1) * productsPageSize;
    return filteredProducts.slice(start, start + productsPageSize);
  }, [filteredProducts, productsPage, productsPageSize, productsTotalPages]);

  useEffect(() => {
    setProductsPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (productsPage > productsTotalPages) {
      setProductsPage(productsTotalPages);
    }
  }, [productsPage, productsTotalPages]);

  // Auto-generate SKU based on brand, product name, and type
  const generateSku = (brand: string, name: string, type: string): string => {
    if (!brand || !name || !type) return '';
    
    // Get brand abbreviation (first 3 letters, uppercase)
    const brandAbbr = brand
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
      .substring(0, 3)
      .toUpperCase();
    
    // Get product name abbreviation
    // Take first letter of each word, or first few letters if single word
    const nameWords = name.trim().split(/\s+/);
    let nameAbbr = '';
    
    if (nameWords.length > 1) {
      // Multiple words: take first letter of each word
      nameAbbr = nameWords
        .map(word => word.charAt(0).toUpperCase())
        .join('');
    } else {
      // Single word: take first 3-4 letters
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
      nameAbbr = cleanName.substring(0, Math.min(6, cleanName.length));
      // Capitalize first letter
      if (nameAbbr.length > 0) {
        nameAbbr = nameAbbr.charAt(0).toUpperCase() + nameAbbr.substring(1).toLowerCase();
      }
    }
    
    // Clean type (remove spaces, keep as is)
    const cleanType = type.trim().replace(/\s+/g, '');
    
    // Combine: Brand-NameAbbr-Type
    return `${brandAbbr}-${nameAbbr}-${cleanType}`;
  };

  // Auto-generate SKU when brand, name, or type changes
  useEffect(() => {
    if (autoGenerateSku && formData.brand && formData.name && formData.type) {
      const generatedSku = generateSku(formData.brand, formData.name, formData.type);
      if (generatedSku) {
        setFormData(prev => ({ ...prev, sku: generatedSku }));
      }
    }
  }, [formData.brand, formData.name, formData.type, autoGenerateSku]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, image: base64String });
      setImagePreview(base64String);
    };
    reader.onerror = () => {
      alert('Error reading image file');
    };
    reader.readAsDataURL(file);
  };

  const addAdditionalImage = () => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: [...prev.additionalImages, ''],
      additionalImageModes: [...prev.additionalImageModes, 'url'],
    }));
  };

  const removeAdditionalImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index),
      additionalImageModes: prev.additionalImageModes.filter((_, i) => i !== index),
    }));
  };

  const setAdditionalImage = (index: number, value: string) => {
    setFormData((prev) => {
      const next = [...prev.additionalImages];
      const nextModes = [...prev.additionalImageModes];
      if (index >= next.length) {
        next.length = index + 1;
        next[index] = value;
        while (nextModes.length < next.length) nextModes.push('url');
        nextModes[index] = value.startsWith('data:') ? 'upload' : 'url';
      } else {
        next[index] = value;
        nextModes[index] = value.startsWith('data:') ? 'upload' : 'url';
      }
      return { ...prev, additionalImages: next, additionalImageModes: nextModes };
    });
  };

  const setAdditionalImageMode = (index: number, mode: 'url' | 'upload') => {
    setFormData((prev) => {
      const nextModes = [...prev.additionalImageModes];
      if (index < nextModes.length) nextModes[index] = mode;
      return { ...prev, additionalImageModes: nextModes };
    });
  };

  const handleAdditionalImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || additionalImageUploadIndex === null) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAdditionalImage(additionalImageUploadIndex, reader.result as string);
      setAdditionalImageUploadIndex(null);
    };
    reader.onerror = () => alert('Error reading image file');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleOpenDialog = (product?: Product) => {
    setSpecTagDraft('');
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brand: product.brand || '',
        category: product.category,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        image: product.image,
        additionalImages: product.images ? [...product.images] : [],
        additionalImageModes: (product.images || []).map(() => 'url' as const),
        description: product.description || '',
        stock: product.stock.toString(),
        sku: product.sku,
        type: product.type || '',
        rating: product.rating.toString(),
        country: product.country,
        reviews: product.reviews.toString(),
        specificationTags: [...getProductSpecificationTags(product)],
      });
      setAutoGenerateSku(false); // Disable auto-generation when editing
      setImagePreview(product.image);
      // Determine if image is base64 or URL
      setImageUploadMode(product.image.startsWith('data:image') ? 'upload' : 'url');
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: '',
        category: sortedAdminCategories[0]?.name || SHOP_CATEGORY_SUGGESTIONS[0] || '',
        price: '',
        originalPrice: '',
        image: '',
        additionalImages: [],
        additionalImageModes: [],
        description: '',
        stock: '',
        sku: '',
        type: '',
        rating: '5',
        country: 'USA',
        reviews: '0',
        specificationTags: [],
      });
      setImagePreview('');
      setImageUploadMode('url');
      setAutoGenerateSku(true); // Enable auto-generation for new products
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate image
    if (!formData.image) {
      alert('Please provide an image URL or upload an image file');
      return;
    }

    const imagesArray = formData.additionalImages.filter(Boolean);
    const productData = {
      name: formData.name,
      brand: formData.brand || undefined,
      category: formData.category,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      image: formData.image,
      images: imagesArray.length > 0 ? imagesArray : undefined,
      description: formData.description || undefined,
      stock: parseInt(formData.stock),
      sku: formData.sku,
      type: formData.type || undefined,
      rating: parseInt(formData.rating),
      country: formData.country,
      reviews: parseInt(formData.reviews),
      specificationTags: formData.specificationTags,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setIsDialogOpen(false);
    setEditingProduct(null);
    setImagePreview('');
    setImageUploadMode('url');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus(null);
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      handleCSVImport(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      handleExcelImport(file);
    } else {
      setImportStatus({
        success: 0,
        errors: [{ row: 0, message: 'Unsupported file format. Please use CSV or Excel (.xlsx, .xls)' }],
      });
    }
  };

  const handleCSVImport = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processImportData(results.data as any[]);
      },
      error: (error) => {
        setImportStatus({
          success: 0,
          errors: [{ row: 0, message: `Error parsing CSV: ${error.message}` }],
        });
      },
    });
  };

  const handleExcelImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        processImportData(jsonData as any[]);
      } catch (error: any) {
        setImportStatus({
          success: 0,
          errors: [{ row: 0, message: `Error parsing Excel: ${error.message}` }],
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processImportData = (data: any[]) => {
    const errors: Array<{ row: number; message: string }> = [];
    let successCount = 0;
    const productsToAdd: Array<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>> = [];
    const existingSkus = new Set(products.map(p => p.sku.toLowerCase()));
    const newSkus = new Set<string>();

    data.forEach((row, index) => {
      try {
        // Map CSV/Excel columns to product fields (case-insensitive)
        const getValue = (keys: string[]) => {
          for (const key of keys) {
            const value = row[key] || row[key.toLowerCase()] || row[key.toUpperCase()];
            if (value !== undefined && value !== null && value !== '') {
              return String(value).trim();
            }
          }
          return '';
        };

        const name = getValue(['name', 'product name', 'product_name', 'title']);
        const category = getValue(['category', 'cat', 'product category', 'product_category']);
        const price = getValue(['price', 'product price', 'product_price', 'cost']);
        let sku = getValue(['sku', 'product sku', 'product_sku', 'code']);
        const image = getValue(['image', 'image url', 'image_url', 'imageUrl', 'picture', 'photo']);
        const stock = getValue(['stock', 'quantity', 'qty', 'inventory', 'stock quantity']);
        const brand = getValue(['brand', 'manufacturer', 'maker']);
        const originalPrice = getValue(['original price', 'original_price', 'originalPrice', 'msrp', 'list price']);
        const description = getValue(['description', 'desc', 'details', 'product description']);
        const type = getValue(['type', 'product type', 'product_type', 'variant', 'weight', 'size']);
        const rating = getValue(['rating', 'stars', 'review rating']) || '5';
        const country = getValue(['country', 'origin', 'made in']) || 'USA';
        const reviews = getValue(['reviews', 'review count', 'review_count', 'num reviews']) || '0';
        const tagsCell = getValue([
          'specification tags',
          'specification_tags',
          'specificationTags',
          'tags',
          'skin concerns',
          'skin_concerns',
          'skinConcerns',
        ]);
        const specificationTags = parseSpecificationTagsCell(tagsCell);

        // Validation
        if (!name) {
          errors.push({ row: index + 2, message: `Row ${index + 2}: Product name is required` });
          return;
        }
        if (!category) {
          errors.push({ row: index + 2, message: `Row ${index + 2}: Category is required` });
          return;
        }
        if (!price || isNaN(parseFloat(price))) {
          errors.push({ row: index + 2, message: `Row ${index + 2}: Valid price is required` });
          return;
        }
        if (!image) {
          errors.push({ row: index + 2, message: `Row ${index + 2}: Image URL is required` });
          return;
        }
        if (!stock || isNaN(parseInt(stock))) {
          errors.push({ row: index + 2, message: `Row ${index + 2}: Valid stock quantity is required` });
          return;
        }

        // Auto-generate SKU if not provided but brand, name, and type are available
        if (!sku && brand && name && type) {
          sku = generateSku(brand, name, type);
        }

        // If still no SKU, require it
        if (!sku) {
          errors.push({ row: index + 2, message: `Row ${index + 2}: SKU is required (or provide brand, name, and type for auto-generation)` });
          return;
        }

        const skuLower = sku.toLowerCase();
        
        // Check if SKU already exists in existing products or in this batch
        if (existingSkus.has(skuLower) || newSkus.has(skuLower)) {
          errors.push({ row: index + 2, message: `Row ${index + 2}: SKU "${sku}" already exists` });
          return;
        }

        // Add to batch
        newSkus.add(skuLower);
        productsToAdd.push({
          name,
          brand: brand || undefined,
          category,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
          image,
          description: description || undefined,
          stock: parseInt(stock),
          sku,
          type: type || undefined,
          rating: parseInt(rating) || 5,
          country,
          reviews: parseInt(reviews) || 0,
          ...(specificationTags ? { specificationTags } : {}),
        });

        successCount++;
      } catch (error: any) {
        errors.push({ row: index + 2, message: `Row ${index + 2}: ${error.message || 'Unknown error'}` });
      }
    });

    // Add all products at once using batch function
    if (productsToAdd.length > 0) {
      addProducts(productsToAdd);
    }

    setImportStatus({ success: successCount, errors });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Product Name',
        brand: 'Brand Name',
        category: 'Category',
        price: '19.99',
        originalPrice: '24.99',
        image: 'https://example.com/image.jpg',
        description: 'Product description',
        stock: '100',
        sku: 'PROD-001',
        rating: '5',
        country: 'USA',
        reviews: '0',
        specificationTags: 'Vegan, Fragrance-free',
      },
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export all products as JSON
  const handleExportJson = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import products from JSON
  const handleJsonImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate that it's an array
        if (!Array.isArray(jsonData)) {
          setJsonImportStatus({
            success: false,
            message: 'Invalid JSON format. Expected an array of products.',
            imported: 0,
          });
          return;
        }

        let imported = 0;
        let skipped = 0;
        const errors: string[] = [];

        jsonData.forEach((product: any, index: number) => {
          try {
            // Validate required fields
            if (!product.name || !product.category || !product.price || !product.sku || !product.image || product.stock === undefined) {
              errors.push(`Row ${index + 1}: Missing required fields`);
              skipped++;
              return;
            }

            // Check if SKU already exists
            const existingProduct = products.find((p) => p.sku.toLowerCase() === product.sku.toLowerCase());
            if (existingProduct) {
              skipped++;
              return;
            }

            const importedSpecTags = specificationTagsFromImportedRecord(product as Record<string, unknown>);

            // Add product
            addProduct({
              name: product.name,
              brand: product.brand || undefined,
              category: product.category,
              price: typeof product.price === 'number' ? product.price : parseFloat(product.price),
              originalPrice: product.originalPrice ? (typeof product.originalPrice === 'number' ? product.originalPrice : parseFloat(product.originalPrice)) : undefined,
              image: product.image,
              description: product.description || undefined,
              stock: typeof product.stock === 'number' ? product.stock : parseInt(product.stock),
              sku: product.sku,
              type: product.type || undefined,
              rating: product.rating || 5,
              country: product.country || 'USA',
              reviews: product.reviews || 0,
              badge: product.badge || undefined,
              overview: product.overview || undefined,
              ingredients: product.ingredients || undefined,
              benefits: product.benefits || undefined,
              howToUse: product.howToUse || undefined,
              tips: product.tips || undefined,
              ...(importedSpecTags?.length ? { specificationTags: importedSpecTags } : {}),
            });

            imported++;
          } catch (error: any) {
            errors.push(`Row ${index + 1}: ${error.message}`);
            skipped++;
          }
        });

        setJsonImportStatus({
          success: imported > 0,
          message: `Imported ${imported} product(s)${skipped > 0 ? `, skipped ${skipped} duplicate(s) or invalid product(s)` : ''}${errors.length > 0 ? `. ${errors.length} error(s) occurred.` : ''}`,
          imported,
        });
      } catch (error: any) {
        setJsonImportStatus({
          success: false,
          message: `Error parsing JSON: ${error.message}`,
          imported: 0,
        });
      }
    };
    reader.onerror = () => {
      setJsonImportStatus({
        success: false,
        message: 'Error reading file',
        imported: 0,
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExportJson}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => setIsJsonImportDialogOpen(true)}>
            <FileJson className="w-4 h-4 mr-2" />
            Import JSON
          </Button>
          <Button
            variant="outline"
            onClick={handleSyncLocalToSupabase}
            disabled={syncingToSupabase}
            title="Push products from this browser’s storage to Supabase (skips duplicates by SKU)"
          >
            <CloudUpload className="w-4 h-4 mr-2" />
            {syncingToSupabase ? 'Syncing…' : 'Sync local to Supabase'}
          </Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV/Excel
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    Loading products…
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => {
                  const specTags = getProductSpecificationTags(product);
                  return (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50"
                    title="Double-click to edit"
                    onDoubleClick={() => handleOpenDialog(product)}
                  >
                    <TableCell>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.brand || '-'}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="max-w-[220px] min-w-[140px] align-top">
                      <div className="flex flex-col gap-1">
                        {specTags.length === 0 ? (
                          <span className="text-gray-400 text-xs">—</span>
                        ) : (
                          specTags.map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-[10px] font-normal px-1.5 py-0.5 w-fit max-w-full justify-start whitespace-normal text-left leading-snug"
                              title={t}
                            >
                              {t}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.type || '-'}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell
                      className="text-right"
                      onDoubleClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {!productsLoading && filteredProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/80 text-sm text-gray-700">
            <div className="flex flex-wrap items-center gap-3">
              <span>
                Showing{' '}
                <span className="font-medium">
                  {(Math.min(productsPage, productsTotalPages) - 1) * productsPageSize + 1}
                </span>
                –
                <span className="font-medium">
                  {Math.min(
                    Math.min(productsPage, productsTotalPages) * productsPageSize,
                    filteredProducts.length
                  )}
                </span>{' '}
                of <span className="font-medium">{filteredProducts.length}</span>
              </span>
              <label className="flex items-center gap-2">
                <span className="text-gray-600">Rows per page</span>
                <select
                  className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
                  value={productsPageSize}
                  onChange={(e) => {
                    setProductsPageSize(Number(e.target.value));
                    setProductsPage(1);
                  }}
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                disabled={Math.min(productsPage, productsTotalPages) <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-gray-600 px-1">
                Page <span className="font-medium text-gray-900">{Math.min(productsPage, productsTotalPages)}</span> of{' '}
                <span className="font-medium text-gray-900">{productsTotalPages}</span>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProductsPage((p) => Math.min(productsTotalPages, p + 1))}
                disabled={Math.min(productsPage, productsTotalPages) >= productsTotalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product information' : 'Add a new product to your catalog'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                {sortedAdminCategories.length > 0 ? (
                  <select
                    id="category"
                    className="border-input flex h-9 w-full min-w-0 rounded-md border bg-input-background px-3 py-1 text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {sortedAdminCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {formData.category.trim() && !categoryNameMatchesAdmin(formData.category) ? (
                      <option value={formData.category}>
                        {formData.category} (current — not in Categories list)
                      </option>
                    ) : null}
                  </select>
                ) : (
                  <>
                    <Input
                      id="category"
                      list={CATEGORY_DATALIST_ID}
                      autoComplete="off"
                      placeholder="e.g. Serum, Cleanser"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                    <datalist id={CATEGORY_DATALIST_ID}>
                      {categorySuggestionList.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </>
                )}
                <p className="text-xs text-gray-500">
                  {sortedAdminCategories.length > 0
                    ? 'Chosen from Categories in admin. Add or rename categories under Categories.'
                    : 'No categories yet — add them under Categories, or type a name (suggestions below).'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Product Type *</Label>
                <Input
                  id="type"
                  placeholder="e.g., 20g, 50g, 100ml"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500">Product variant/type (e.g., weight, size)</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3">
              <div>
                <Label className="text-base">Product tags</Label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tap a tag to add or remove it. Presets include defaults plus every tag already used on another product (for example, after you add Chocolates on one product, it appears here for all products). Shoppers filter by these on the shop.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Tag presets</p>
                <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
                  {specificationTagSuggestions.map((tag) => {
                    const checked = formData.specificationTags.some(
                      (t) => t.toLowerCase() === tag.toLowerCase()
                    );
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => togglePresetSpecificationTag(tag)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors text-left ${
                          checked
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-primary/40'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
              {formData.specificationTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.specificationTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white pl-3 pr-1 py-1 text-xs text-gray-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeSpecificationTag(tag)}
                        className="rounded-full p-0.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="spec-tag-input"
                  list={SPEC_TAG_DATALIST_ID}
                  autoComplete="off"
                  placeholder="Type a tag and add (e.g. Vegan, SPF 50, Sensitive)"
                  value={specTagDraft}
                  onChange={(e) => setSpecTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSpecificationTagFromDraft();
                    }
                  }}
                  className="flex-1"
                />
                <datalist id={SPEC_TAG_DATALIST_ID}>
                  {specificationTagSuggestions.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                <Button type="button" variant="secondary" onClick={addSpecificationTagFromDraft}>
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add tag</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sku">SKU *</Label>
                {!editingProduct && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto-sku"
                      checked={autoGenerateSku}
                      onChange={(e) => setAutoGenerateSku(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="auto-sku" className="text-xs text-gray-600 cursor-pointer">
                      Auto-generate
                    </Label>
                  </div>
                )}
              </div>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => {
                  setFormData({ ...formData, sku: e.target.value });
                  setAutoGenerateSku(false);
                }}
                required
                placeholder={autoGenerateSku && !editingProduct ? "Will be auto-generated" : "Enter SKU"}
                disabled={!!(autoGenerateSku && !editingProduct && formData.brand && formData.name && formData.type)}
                className={autoGenerateSku && !editingProduct && formData.brand && formData.name && formData.type ? "bg-gray-50" : ""}
              />
              {autoGenerateSku && !editingProduct && formData.brand && formData.name && formData.type && (
                <p className="text-xs text-blue-600">
                  SKU will be generated as: {generateSku(formData.brand, formData.name, formData.type)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="image">Product Image *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={imageUploadMode === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setImageUploadMode('url');
                      if (imageUploadRef.current) {
                        imageUploadRef.current.value = '';
                      }
                    }}
                  >
                    URL
                  </Button>
                  <Button
                    type="button"
                    variant={imageUploadMode === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setImageUploadMode('upload');
                      setFormData({ ...formData, image: '' });
                    }}
                  >
                    Upload
                  </Button>
                </div>
              </div>

              {imageUploadMode === 'url' ? (
                <div className="space-y-2">
                  <Input
                    id="image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    required={imageUploadMode === 'url'}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    ref={imageUploadRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => imageUploadRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image File
                  </Button>
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                  </p>
                </div>
              )}

              {imagePreview && (
                <div className="mt-4">
                  <Label>Image Preview</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-contain"
                      onError={() => setImagePreview('')}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <input
                ref={additionalImageUploadRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAdditionalImageUpload}
              />
              <div className="flex items-center justify-between">
                <Label>Additional images</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAdditionalImage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add image
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Shown as thumbnails under the main image on the product page. Each image: URL or upload (max 5MB).
              </p>
              {formData.additionalImages.map((url, index) => (
                <div key={index} className="rounded-lg border p-4 space-y-3 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Image {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeAdditionalImage(index)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.additionalImageModes[index] === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAdditionalImageMode(index, 'url')}
                    >
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={formData.additionalImageModes[index] === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setAdditionalImageMode(index, 'upload');
                        setAdditionalImageUploadIndex(index);
                        additionalImageUploadRef.current?.click();
                      }}
                    >
                      Upload
                    </Button>
                  </div>
                  {formData.additionalImageModes[index] === 'url' ? (
                    <Input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={url}
                      onChange={(e) => setAdditionalImage(index, e.target.value)}
                    />
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAdditionalImageUploadIndex(index);
                        additionalImageUploadRef.current?.click();
                      }}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image File
                    </Button>
                  )}
                  {url ? (
                    <div className="mt-2 border rounded-lg overflow-hidden bg-white max-w-[12rem]">
                      <img
                        src={url}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-28 object-contain"
                        onError={() => setAdditionalImage(index, '')}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingProduct ? 'Update' : 'Add'} Product</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteProduct(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Products Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Products from CSV/Excel</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file to import multiple products at once
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-4">
                  <FileSpreadsheet className="w-12 h-12 text-gray-400" />
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Upload CSV or Excel file
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Supported formats: .csv, .xlsx, .xls
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Required Columns:</h4>
              <p className="text-xs text-blue-700 mb-2">
                name, category, price, sku, image, stock
              </p>
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Optional Columns:</h4>
              <p className="text-xs text-blue-700">
                brand, originalPrice, description, rating (default: 5), country (default: USA), reviews (default: 0)
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={downloadTemplate}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>

            {importStatus && (
              <div className="space-y-2">
                {importStatus.success > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Successfully imported {importStatus.success} product(s)
                      </p>
                    </div>
                  </div>
                )}

                {importStatus.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <p className="text-sm font-medium text-red-900">
                        {importStatus.errors.length} error(s) found
                      </p>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {importStatus.errors.map((error, idx) => (
                        <p key={idx} className="text-xs text-red-700">
                          {error.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportStatus(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import JSON Dialog */}
      <Dialog open={isJsonImportDialogOpen} onOpenChange={setIsJsonImportDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Products from JSON</DialogTitle>
            <DialogDescription>
              Upload a JSON file exported from another environment (e.g., production) to sync your products
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <FileJson className="w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Upload JSON file
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    This will import products from a JSON export file
                  </p>
                  <input
                    ref={jsonFileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleJsonImport}
                    className="hidden"
                    id="json-file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => jsonFileInputRef.current?.click()}
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    Choose JSON File
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">How to use:</h4>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to your production/admin site</li>
                <li>Click "Export JSON" to download all products</li>
                <li>Come back here and click "Import JSON"</li>
                <li>Select the downloaded JSON file</li>
                <li>Products will be imported (duplicates by SKU will be skipped)</li>
              </ol>
            </div>

            {jsonImportStatus && (
              <div className={`border rounded-lg p-4 flex items-start gap-3 ${
                jsonImportStatus.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                {jsonImportStatus.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    jsonImportStatus.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {jsonImportStatus.message}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsJsonImportDialogOpen(false);
                  setJsonImportStatus(null);
                  if (jsonFileInputRef.current) {
                    jsonFileInputRef.current.value = '';
                  }
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

