# Industrial Kitchen & Catering Consultancy Platform

A comprehensive web platform for industrial kitchen and catering consultancy services, featuring a modern multilingual public website and a secure management portal.

## 🚀 Project Overview

This platform provides:
- **Public Website**: Multilingual product showcase, contact forms, and service information
- **Secure Management Portal**: Complete management system for products, translations, client requests, and quotations
- **Modern Design**: Professional UI with shadcn/ui components and Tailwind CSS
- **Responsive**: Optimized for all devices from mobile to desktop

## 🏗️ Folder Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Main navigation with language selector
│   │   ├── Footer.tsx              # Footer with company information
│   │   ├── Layout.tsx              # Main layout wrapper
│   │   └── LanguageSelector.tsx    # Flag-based language switcher
│   ├── product/
│   │   ├── ProductCard.tsx         # Product display card
│   │   ├── ProductModal.tsx        # Product details modal
│   │   └── ProductFilters.tsx      # Search and filter components
│   └── ui/                         # shadcn/ui components
├── contexts/
│   └── LanguageContext.tsx         # Language management context
├── lib/
│   ├── languages.ts                # Language configuration
│   └── utils.ts                    # Utility functions
├── pages/
│   ├── HomePage.tsx                # Landing page with hero section
│   ├── InoksanPage.tsx             # Industrial kitchen equipment
│   ├── ContactPage.tsx             # Contact form and information
│   └── SpecialRequestPage.tsx      # Service offerings
├── types/
│   └── index.ts                    # TypeScript interfaces
└── App.tsx                         # Main application component
```

## 🗄️ Database Schema

### Core Tables

**products**
- `id` (uuid, primary key)
- `name` (text)
- `code` (text) - Display product code
- `supplier_code` (text) - Supplier-specific code (Inoksan only)
- `price` (decimal)
- `category` (text)
- `subcategory` (text)
- `description` (text)
- `image_url` (text)
- `page_reference` (text) - Which page to display on
- `created_at` (timestamp)
- `updated_at` (timestamp)

**product_translations**
- `id` (uuid, primary key)
- `product_id` (uuid, foreign key)
- `language_code` (text)
- `name` (text)
- `description` (text)
- `page_reference` (text)
- Unique constraint on (product_id, language_code)

**portal_users**
- `id` (uuid, primary key)
- `email` (text, unique)
- `role` (enum: 'supermanager', 'editor', 'viewer')
- `created_at` (timestamp)
- `updated_at` (timestamp)

**contact_requests**
- `id` (uuid, primary key)
- `name` (text)
- `company` (text)
- `country` (text)
- `phone` (text)
- `email` (text)
- `sla_level` (text)
- `request_type` (text)
- `message` (text)
- `file_attachment` (text)
- `status` (enum: 'pending', 'in_progress', 'completed')
- `created_at` (timestamp)
- `updated_at` (timestamp)

**translations**
- `id` (uuid, primary key)
- `key` (text)
- `language_code` (text)
- `value` (text)
- Unique constraint on (key, language_code)

**sla_levels**
- `id` (uuid, primary key)
- `name` (text)
- `response_time` (text)

**request_types**
- `id` (uuid, primary key)
- `name` (text)
- `description` (text)

## 📱 Page/Component Mapping

### Public Pages

| Page | Component | Route | Features |
|------|-----------|-------|----------|
| Home | `HomePage.tsx` | `/` | Hero, stats, product overview, CTA |
| Inoksan | `InoksanPage.tsx` | `/inoksan` | Products with discount input, supplier codes |
| Contact | `ContactPage.tsx` | `/contact` | Contact form, company information |
| Special Request | `SpecialRequestPage.tsx` | `/special-request` | Service offerings, pricing |

### Key Features by Page

**HomePage**
- Hero section with call-to-action
- Company statistics
- Product category overview
- Client testimonials section
- Image slideshow integration

**InoksanPage** (Special Features)
- Manual discount input in filters
- Supplier code display in product modals
- Category-based product organization
- Subcategory dividers

**ContactPage**
- Multi-field contact form
- SLA level selection
- Request type categorization
- File attachment support

**SpecialRequestPage**
- Service cards with pricing
- Timeline information
- Included services lists
- Call-to-action buttons

## 🌐 Language Support

The platform supports 5 languages:
- **English** (en) - Default
- **Arabic** (ar)
- **Turkish** (tr)
- **Spanish** (es)
- **Russian** (ru)

Language switching is handled via flag-based selector with context management.

## 🔧 Setup Instructions

### Local Development

1. **Clone and Install**
   ```bash
   git clone [repository-url]
   cd industrial-kitchen-consultancy
   npm install
   ```

2. **Environment Setup**
   - Create `.env` file with Supabase credentials
   - Configure database connection

3. **Database Setup**
   - Run migration files to create tables
   - Set up Row Level Security (RLS) policies
   - Insert initial data

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   - Set production Supabase credentials
   - Configure domain and API endpoints

3. **Database Migration**
   - Run production migrations
   - Set up portal user accounts
   - Configure storage buckets

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#0066CC)
- **Secondary**: Teal (#14B8A6)
- **Accent**: Orange (#F97316)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Headings**: 120% line height, bold weights
- **Body**: 150% line height, regular weight
- **UI Elements**: Medium weight, consistent sizing

### Layout System
- **Spacing**: 8px base unit system
- **Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- **Shadows**: Subtle, layered elevation
- **Borders**: Rounded corners for modern feel

## 🔐 Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Role-based access control
- **RLS**: Row Level Security on all tables
- **Input Validation**: Form validation and sanitization
- **File Upload**: Secure file handling with type restrictions

## 📊 Secure Management Portal Features

- **Client Requests**: View, respond, and manage contact submissions
- **Translations**: Multilingual content management
- **Product Manager**: Real-time product editing
- **Image Manager**: UI asset management
- **User Management**: Portal user roles and permissions
- **Quotation Builder**: Generate and manage client quotes

## 🚀 Performance Optimizations

- **Lazy Loading**: Component and image lazy loading
- **Optimized Images**: Responsive image handling
- **Efficient Queries**: Optimized database queries
- **Caching**: Strategic caching implementation
- **Bundle Splitting**: Code splitting for faster loads

## 📞 Support

For technical support or questions, please contact the development team or refer to the documentation.

## 📝 License

This project is proprietary software. All rights reserved.