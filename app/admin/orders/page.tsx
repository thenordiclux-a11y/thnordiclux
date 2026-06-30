'use client'
import { useState, useRef } from 'react';
import { useData, Invoice } from '../../contexts/DataContext';
import { Button } from '../../components/ui/button';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Eye, Search, Printer } from 'lucide-react';
import { Input } from '../../components/ui/input';

export default function Orders() {
  const { invoices, updateInvoice } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFlushDialogOpen, setIsFlushDialogOpen] = useState(false);
  const [isFlushing, setIsFlushing] = useState(false);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (invoiceId: string, status: string) => {
    updateInvoice(invoiceId, { status: status as Invoice['status'] });
  };

  const handlePaymentStatusChange = (invoiceId: string, paymentStatus: string) => {
    updateInvoice(invoiceId, { paymentStatus: paymentStatus as Invoice['paymentStatus'] });
  };

  const invoicePrintRef = useRef<HTMLDivElement>(null);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  const handlePrintInvoice = () => {
    if (!invoicePrintRef.current) return;
    const printContent = invoicePrintRef.current.innerHTML;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Invoice ${selectedInvoice?.orderNumber}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
          .inv-header { display: flex; justify-content: space-between; margin-bottom: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; }
          .inv-title { font-size: 24px; font-weight: 700; }
          .inv-meta { text-align: right; font-size: 14px; color: #6b7280; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; }
          th { background: #f9fafb; font-weight: 600; }
          .text-right { text-align: right; }
          .totals { margin-left: auto; width: 240px; margin-top: 16px; }
          .totals row { display: flex; justify-content: space-between; padding: 4px 0; }
          .totals .total { font-weight: 700; font-size: 18px; border-top: 2px solid #111; padding-top: 8px; margin-top: 8px; }
          .status { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; margin-top: 8px; }
          .bill-to, .ship-to { margin-bottom: 16px; font-size: 14px; }
          .bill-to h4, .ship-to h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 4px; }
        </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const handleFlushOrders = async () => {
    setIsFlushing(true);
    try {
      const response = await fetch('/api/clear-orders', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to clear orders.');
      }
      window.location.reload();
    } catch (error: any) {
      window.alert(`Could not clear orders: ${error?.message ?? error}`);
    } finally {
      setIsFlushing(false);
      setIsFlushDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage customer orders and invoices</p>
        </div>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setIsFlushDialogOpen(true)}
          disabled={isFlushing}
        >
          Clear all orders
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">#{invoice.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.customerName}</p>
                        <p className="text-sm text-gray-500">{invoice.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.items.length} items</TableCell>
                    <TableCell className="font-medium">${invoice.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={invoice.status}
                        onValueChange={(value) => handleStatusChange(invoice.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={invoice.paymentStatus}
                        onValueChange={(value) => handlePaymentStatusChange(invoice.id, value)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Order / Full Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Invoice #{selectedInvoice?.orderNumber}</DialogTitle>
                <DialogDescription>Billing and order details</DialogDescription>
              </div>
              {selectedInvoice && (
                <Button variant="outline" size="sm" onClick={handlePrintInvoice} className="gap-2">
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Printable invoice content */}
              <div ref={invoicePrintRef} className="space-y-6 print-invoice">
                <div className="inv-header flex justify-between items-start border-b border-gray-200 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Nordic Lux</h2>
                    <p className="text-sm text-gray-500">Premium Beauty &amp; Wellness</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">INVOICE</p>
                    <p className="text-sm text-gray-500">#{selectedInvoice.orderNumber}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bill-to">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Bill To</h4>
                    <p className="font-medium text-gray-900">{selectedInvoice.customerName}</p>
                    <p className="text-sm text-gray-600">{selectedInvoice.customerEmail}</p>
                    {selectedInvoice.customerPhone && (
                      <p className="text-sm text-gray-600">{selectedInvoice.customerPhone}</p>
                    )}
                  </div>
                  <div className="ship-to">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Ship To</h4>
                    {selectedInvoice.shippingAddress?.address ? (
                      <>
                        <p className="text-sm text-gray-900">{selectedInvoice.customerName}</p>
                        <p className="text-sm text-gray-600">{selectedInvoice.shippingAddress.address}</p>
                        <p className="text-sm text-gray-600">
                          {[selectedInvoice.shippingAddress.city, selectedInvoice.shippingAddress.state, selectedInvoice.shippingAddress.zipCode]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        {selectedInvoice.shippingAddress.country && (
                          <p className="text-sm text-gray-600">{selectedInvoice.shippingAddress.country}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">Same as billing</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              ${(item.quantity * item.price).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span>${selectedInvoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>${selectedInvoice.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                      <span>Total</span>
                      <span>${selectedInvoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Payment</span>
                    <p className="font-medium capitalize">{selectedInvoice.paymentStatus}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Order Status</span>
                    <p className="font-medium capitalize">{selectedInvoice.status}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFlushDialogOpen} onOpenChange={setIsFlushDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Clear all orders</DialogTitle>
                <DialogDescription>
                  This will permanently delete every order from the database and reset customer order totals.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              This action cannot be undone. Only use it if you want to flush all previous orders from the system.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <Button variant="secondary" onClick={() => setIsFlushDialogOpen(false)} disabled={isFlushing}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleFlushOrders} disabled={isFlushing}>
                {isFlushing ? 'Clearing...' : 'Clear all orders'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

