'use client'

import Link from 'next/link';
import { useData } from '../../contexts/DataContext';
import {
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  Plus,
  FileText,
  FolderTree,
  TrendingUp,
  Eye,
  CheckCircle,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { products, customers, invoices } = useData();

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalOrders = invoices.length;
  const pendingOrders = invoices.filter((inv) => inv.status === 'pending').length;
  const confirmedOrders = invoices.filter(
    (inv) => inv.status === 'processing' || inv.status === 'shipped' || inv.status === 'delivered'
  ).length;
  const totalProducts = products.length;
  const totalCustomers = customers.length;

  const recentInvoices = invoices.slice(-5).reverse();
  const recentRevenue = recentInvoices
    .filter((inv) => inv.status === 'processing' || inv.status === 'shipped' || inv.status === 'delivered')
    .reduce((sum, inv) => sum + inv.total, 0);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const ordersThisWeek = invoices.filter((inv) => new Date(inv.createdAt) >= startOfWeek).length;
  const ordersThisMonth = invoices.filter((inv) => new Date(inv.createdAt) >= startOfMonth).length;
  const revenueThisWeek = invoices
    .filter((inv) => new Date(inv.createdAt) >= startOfWeek)
    .reduce((sum, inv) => sum + inv.total, 0);
  const revenueThisMonth = invoices
    .filter((inv) => new Date(inv.createdAt) >= startOfMonth)
    .reduce((sum, inv) => sum + inv.total, 0);

  const productSales: Record<string, { name: string; qty: number }> = {};
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const key = item.productId;
      if (!productSales[key]) productSales[key] = { name: item.productName, qty: 0 };
      productSales[key].name = item.productName;
      productSales[key].qty += item.quantity;
    });
  });
  const topProducts = Object.entries(productSales)
    .map(([id, { name, qty }]) => ({ id, name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      href: '/admin/analytics',
      color: 'text-green-600',
    },
    {
      name: 'Total Orders',
      value: totalOrders.toString(),
      change: `+${confirmedOrders}`,
      changeType: 'positive' as const,
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'text-blue-600',
    },
    {
      name: 'Products',
      value: totalProducts.toString(),
      change: '+5',
      changeType: 'positive' as const,
      icon: Package,
      href: '/admin/products',
      color: 'text-purple-600',
    },
    {
      name: 'Customers',
      value: totalCustomers.toString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: Users,
      href: '/admin/customers',
      color: 'text-orange-600',
    },
  ];

  const quickActions = [
    {
      name: 'Add New Product',
      description: 'Create a new product',
      href: '/admin/products',
      icon: Plus,
      color: 'bg-blue-500',
    },
    {
      name: 'View Orders',
      description: 'Manage all orders',
      href: '/admin/orders',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      name: 'Add Category',
      description: 'Add new category',
      href: '/admin/categories',
      icon: FolderTree,
      color: 'bg-purple-500',
    },
    {
      name: 'View Analytics',
      description: 'See detailed reports',
      href: '/admin/analytics',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      {stat.change && (
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                          {stat.change}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div>
                  <span className={`rounded-lg inline-flex p-3 ${action.color} ring-4 ring-white`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {action.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{action.description}</p>
                </div>
                <span
                  className="absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                  aria-hidden="true"
                >
                  <ArrowRight className="h-6 w-6" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          <div className="flow-root">
            {recentInvoices.length > 0 ? (
              <ul className="-my-5 divide-y divide-gray-200">
                {recentInvoices.map((invoice) => (
                  <li key={invoice.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {invoice.customerName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Order #{invoice.orderNumber} • {invoice.items.length} items
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === 'processing' || invoice.status === 'shipped'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : invoice.status === 'delivered'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex-shrink-0 text-sm font-medium text-gray-900">
                        ${invoice.total.toFixed(2)}
                      </div>
                      <div className="flex-shrink-0">
                        <Link href="/admin/orders" className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent orders</h3>
                <p className="mt-1 text-sm text-gray-500">
                  New orders will appear here as they come in.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report summaries */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Report Summaries</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Revenue this week</dt>
                <dd className="text-lg font-medium text-gray-900 mt-1">${revenueThisWeek.toLocaleString()}</dd>
              </dl>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Revenue this month</dt>
                <dd className="text-lg font-medium text-gray-900 mt-1">${revenueThisMonth.toLocaleString()}</dd>
              </dl>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Orders this week</dt>
                <dd className="text-lg font-medium text-gray-900 mt-1">{ordersThisWeek}</dd>
              </dl>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Orders this month</dt>
                <dd className="text-lg font-medium text-gray-900 mt-1">{ordersThisMonth}</dd>
              </dl>
            </div>
          </div>
          {topProducts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Top selling products</h4>
              <ul className="space-y-2">
                {topProducts.map((p, i) => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span className="text-gray-900 truncate max-w-[200px]" title={p.name}>{i + 1}. {p.name}</span>
                    <span className="text-gray-600 font-medium">{p.qty} sold</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Performance Overview</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{pendingOrders}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Confirmed Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{confirmedOrders}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Recent Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${recentRevenue.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

