# Admin Dashboard Documentation

## Overview
A comprehensive admin dashboard for Nordic Lux with full CMS capabilities including product management, order/invoice management, customer management, analytics, SEO, and more.

## Access
- **URL**: Navigate to `/admin/login` from the main website
- **Default Credentials**:
  - Email: `admin@nordiclux.com`
  - Password: `admin123`

## Features

### 1. Dashboard
- Overview of key metrics (Revenue, Orders, Products, Customers)
- Recent orders display
- Quick stats and insights

### 2. Products Management
- **View**: List all products with search functionality
- **Add**: Create new products with full details (name, brand, category, price, stock, images, etc.)
- **Edit**: Update existing product information
- **Delete**: Remove products from catalog
- Features:
  - Product images
  - SKU management
  - Stock tracking
  - Pricing (regular and original price for discounts)
  - Categories and brands
  - Ratings and reviews

### 3. Categories Management
- **View**: List all product categories
- **Add**: Create new categories
- **Edit**: Update category information
- **Delete**: Remove categories
- Features:
  - Category images
  - Slug generation
  - Product count tracking
  - Descriptions

### 4. Invoices & Orders
- **View**: List all customer orders/invoices
- **Search**: Find orders by order number, customer name, or email
- **Status Management**: Update order status (Pending, Processing, Shipped, Delivered, Cancelled)
- **Payment Status**: Manage payment status (Pending, Paid, Refunded)
- **View Details**: See full order details including items, customer info, and totals

### 5. Customers Management
- **View**: List all registered customers
- **Add**: Create new customer accounts
- **Edit**: Update customer information
- **Search**: Find customers by name or email
- Features:
  - Customer contact information
  - Address management
  - Order history tracking
  - Total spent tracking

### 6. Analytics
- **Revenue Charts**: Monthly revenue trends
- **Order Status Distribution**: Pie chart of order statuses
- **Top Products**: Bar chart of best-selling products
- **Sales Overview**: Visual representation of sales data
- **Key Metrics**:
  - Total Revenue
  - Average Order Value
  - Total Orders
  - Conversion Rate

### 7. SEO Management
- **Page SEO Settings**: Manage SEO metadata for different pages
- **Pages Available**:
  - Home Page
  - Products Page
  - Categories Page
  - About Page
  - Contact Page
- **Features**:
  - Page titles (with character counter)
  - Meta descriptions (with character counter)
  - Keywords management
  - Open Graph images for social sharing
  - Last updated tracking

## Data Storage
All data is currently stored in browser localStorage. This means:
- Data persists across sessions
- Data is browser-specific (not shared across devices)
- For production, you should connect to a backend API

## Navigation
The admin dashboard features a responsive sidebar navigation with:
- Dashboard
- Products
- Categories
- Invoices
- Customers
- Analytics
- SEO

## Responsive Design
- Mobile-friendly sidebar (collapsible on mobile)
- Responsive tables and forms
- Touch-friendly interface

## Security Notes
- The current authentication is basic (hardcoded credentials)
- For production, implement:
  - Secure backend authentication
  - JWT tokens or session management
  - Password hashing
  - Role-based access control
  - API security

## Future Enhancements
Consider adding:
- Backend API integration
- Real-time updates
- Export functionality (CSV, PDF)
- Advanced filtering and sorting
- Bulk operations
- Image upload functionality
- Email notifications
- User roles and permissions
- Audit logs

