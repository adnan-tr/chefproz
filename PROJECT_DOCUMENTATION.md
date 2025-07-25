# ChefGear Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Database Schema](#database-schema)
3. [File Structure & Relationships](#file-structure--relationships)
4. [Page-to-Backend Connections](#page-to-backend-connections)
5. [Image Management](#image-management)
6. [Component Dependencies](#component-dependencies)
7. [Configuration Files](#configuration-files)
8. [How to Make Changes](#how-to-make-changes)

## Project Overview

ChefGear is a React-based web application for professional kitchen and catering solutions. It features:
- Multi-language support (English/Turkish)
- Product catalog management
- Admin panel for content management
- Contact request system
- Quotation builder
- Company details management

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Routing**: React Router DOM
- **State Management**: React Context API

## Database Schema

### Core Tables

#### 1. `products`
**Purpose**: Store all product information
**Location**: Managed via Supabase dashboard
**Related Files**:
- `src/lib/supabase.ts` (CRUD operations)
- `src/pages/admin/ProductManagerPage.tsx` (Admin interface)
- `src/components/product/ProductCard.tsx` (Display)
- `src/components/product/ProductModal.tsx` (Details)

**Fields**:
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `code` (VARCHAR)
- `supplier_code` (VARCHAR)
- `category` (VARCHAR)
- `page_reference` (VARCHAR) - Links to specific pages
- `price` (DECIMAL)
- `description` (TEXT)
- `image_url` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

#### 2. `contact_requests`
**Purpose**: Store customer inquiries
**Related Files**:
- `src/pages/ContactPage.tsx` (Form submission)
- `src/pages/admin/ClientDashboardPage.tsx` (Admin view)
- `src/lib/supabase.ts` (Database operations)

**Fields**:
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `company` (VARCHAR)
- `message` (TEXT)
- `status` (VARCHAR) - 'pending', 'responded', 'closed'
- `priority` (VARCHAR) - 'low', 'medium', 'high'
- `created_at` (TIMESTAMP)

#### 3. `company_details`
**Purpose**: Store company information (logo, contact details, etc.)
**Related Files**:
- `src/contexts/CompanyContext.tsx` (State management)
- `src/components/admin/CompanyDetailsPopup.tsx` (Admin interface)
- `src/components/layout/Header.tsx` (Logo display)
- `src/components/layout/Footer.tsx` (Company info display)

**Fields**:
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `logo` (TEXT) - Base64 encoded image
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `address` (TEXT)
- `website` (VARCHAR)
- `updated_at` (TIMESTAMP)

#### 4. `admin_users`
**Purpose**: Admin authentication and role management
**Related Files**:
- `src/contexts/AuthContext.tsx` (Authentication)
- `src/pages/admin/AdminLoginPage.tsx` (Login interface)

**Fields**:
- `id` (UUID, Primary Key)
- `email` (TEXT)
- `name` (TEXT)
- `role` (TEXT) - 'supermanager', 'editor', 'viewer'
- `password_hash` (TEXT)
- `status` (TEXT) - 'active', 'inactive'
- `created_at`, `updated_at` (TIMESTAMP)

#### 5. `translations`
**Purpose**: Multi-language content
**Related Files**:
- `src/contexts/LanguageContext.tsx` (Language switching)
- `src/lib/languages.ts` (Language configuration)
- `src/pages/admin/TranslationsPage.tsx` (Admin interface)

**Fields**:
- `id` (UUID, Primary Key)
- `key` (VARCHAR) - Translation key
- `en` (TEXT) - English text
- `tr` (TEXT) - Turkish text

#### 6. `services`
**Purpose**: Service offerings
**Related Files**:
- `src/components/admin/ServiceAdmin.tsx` (Admin interface)
- `src/pages/admin/SetupServicesPage.tsx` (Setup)

#### 7. `advertisement_brands`
**Purpose**: Advertisement banners on contact page
**Related Files**:
- `src/components/AdvertisementBar.tsx` (Display)
- `src/lib/advertisementService.ts` (Data fetching)

## File Structure & Relationships

### Core Application Files

#### `src/App.tsx`
**Purpose**: Main application component with routing
**Dependencies**:
- All page components
- Layout components
- Context providers
- Error boundary

#### `src/main.tsx`
**Purpose**: Application entry point
**Dependencies**:
- `App.tsx`
- Global CSS imports

### Context Files (State Management)

#### `src/contexts/LanguageContext.tsx`
**Purpose**: Manages language switching and translations
**Connected to**:
- `translations` table
- All components using `useLanguage()` hook
- `src/lib/languages.ts`

#### `src/contexts/CompanyContext.tsx`
**Purpose**: Manages company details state
**Connected to**:
- `company_details` table
- Header and Footer components
- Company details admin popup

#### `src/contexts/AuthContext.tsx`
**Purpose**: Admin authentication state
**Connected to**:
- `admin_users` table
- All admin pages
- Protected routes

### Page Components

#### Public Pages
- `src/pages/HomePage.tsx` - Landing page with hero section
- `src/pages/AboutPage.tsx` - Company information
- `src/pages/ContactPage.tsx` - Contact form + advertisement banners
- `src/pages/InoksanPage.tsx` - Inoksan products (connects to `products` table)
- `src/pages/RefrigerationPage.tsx` - Refrigeration products
- `src/pages/KitchenToolsPage.tsx` - Kitchen tools products
- `src/pages/HotelEquipmentPage.tsx` - Hotel equipment products

#### Admin Pages
- `src/pages/admin/AdminDashboardPage.tsx` - Main admin dashboard
- `src/pages/admin/ProductManagerPage.tsx` - Product CRUD operations
- `src/pages/admin/ClientDashboardPage.tsx` - Contact requests management
- `src/pages/admin/TranslationsPage.tsx` - Language content management
- `src/pages/admin/ImageManagerPage.tsx` - Image upload and management

### Layout Components

#### `src/components/layout/Header.tsx`
**Purpose**: Main navigation with company logo
**Dependencies**:
- `CompanyContext` (for logo and company name)
- `LanguageContext` (for translations)
- Navigation links to all pages

#### `src/components/layout/Footer.tsx`
**Purpose**: Footer with company information
**Dependencies**:
- `CompanyContext` (for company details)
- `LanguageContext` (for translations)

#### `src/components/layout/Layout.tsx`
**Purpose**: Main layout wrapper
**Dependencies**:
- Header and Footer components
- All context providers

### Database Service

#### `src/lib/supabase.ts`
**Purpose**: Central database operations file
**Contains**:
- Supabase client configuration
- All CRUD operations for every table
- Admin client with service role (bypasses RLS)

**Key Functions**:
- `getProducts()` - Fetch products with filtering
- `createContactRequest()` - Submit contact forms
- `getCompanyDetails()` - Fetch company information
- `updateCompanyDetails()` - Update company information
- `getTranslations()` - Fetch language translations

## Page-to-Backend Connections

### Product Pages → Database
```
InoksanPage.tsx → products table (page_reference: 'inoksan')
RefrigerationPage.tsx → products table (page_reference: 'refrigeration')
KitchenToolsPage.tsx → products table (page_reference: 'kitchen-tools')
HotelEquipmentPage.tsx → products table (page_reference: 'hotel-equipment')
```

### Contact System
```
ContactPage.tsx → contact_requests table (form submission)
ClientDashboardPage.tsx → contact_requests table (admin view)
```

### Company Information
```
Header.tsx → company_details table (logo, name)
Footer.tsx → company_details table (contact info)
CompanyDetailsPopup.tsx → company_details table (admin editing)
```

### Multi-language Content
```
All components → translations table (via LanguageContext)
TranslationsPage.tsx → translations table (admin editing)
```

## Image Management

### Image Storage Locations

#### 1. Supabase Storage Bucket: `images`
**Purpose**: Main image storage
**Access**: Via `src/pages/admin/ImageManagerPage.tsx`
**Folders**:
- `trans/` - Transformation/gallery images
- `products/` - Product images
- `general/` - General purpose images

#### 2. Public Assets: `public/`
**Files**:
- `vite.svg` - Favicon
- `placeholder-product.svg` - Product placeholder
- `_redirects` - Netlify redirects

#### 3. Source Assets: `src/assets/`
**Files**:
- `image.png` - Static images used in components

### Image Usage in Components

#### Company Logo
**Location**: Stored in `company_details.logo` (Base64)
**Display**: `src/components/layout/Header.tsx`
**Management**: `src/components/admin/CompanyDetailsPopup.tsx`

#### Product Images
**Location**: `products.image_url` field
**Display**: `src/components/product/ProductCard.tsx`
**Management**: `src/pages/admin/ProductManagerPage.tsx`

#### Background Images
**Location**: Inline styles or Tailwind classes
**Files to check**:
- `src/pages/HomePage.tsx` (hero background)
- `src/pages/ContactPage.tsx` (section backgrounds)

### How to Change Images

#### 1. Company Logo
```typescript
// Navigate to: Admin Panel → Company Details
// Or edit directly in: src/components/admin/CompanyDetailsPopup.tsx
// Database: company_details.logo field
```

#### 2. Product Images
```typescript
// Navigate to: Admin Panel → Product Manager
// Or edit directly in: src/pages/admin/ProductManagerPage.tsx
// Database: products.image_url field
```

#### 3. Static Images
```typescript
// Replace files in: public/ or src/assets/
// Update imports in relevant components
```

#### 4. Background Images
```typescript
// Edit CSS classes in component files
// Example: src/pages/HomePage.tsx line ~230-250
```

## Component Dependencies

### UI Components (`src/components/ui/`)
**Source**: shadcn/ui library
**Files**: button.tsx, card.tsx, input.tsx, dialog.tsx, etc.
**Usage**: Imported throughout the application

### Product Components
```
ProductCard.tsx → ProductModal.tsx
ProductFilters.tsx → Product pages
```

### Admin Components
```
ServiceAdmin.tsx → Admin dashboard
CompanyDetailsPopup.tsx → Header/Footer (via CompanyContext)
```

## Configuration Files

### `package.json`
**Purpose**: Dependencies and scripts
**Key Scripts**:
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build

### `vite.config.ts`
**Purpose**: Vite configuration
**Key Settings**:
- Path aliases (@/ → src/)
- Build settings
- Development server config

### `tailwind.config.js`
**Purpose**: Tailwind CSS configuration
**Customizations**:
- Color scheme
- Component styles
- Responsive breakpoints

### `tsconfig.json`
**Purpose**: TypeScript configuration
**Key Settings**:
- Path mapping
- Strict type checking
- Module resolution

### Environment Variables
**File**: `.env` (not in repository)
**Required Variables**:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## How to Make Changes

### 1. Adding a New Page
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/layout/Header.tsx`
4. Add translations in `translations` table

### 2. Modifying Database Schema
1. Update table via Supabase dashboard
2. Update TypeScript types in `src/types/`
3. Update CRUD operations in `src/lib/supabase.ts`
4. Update related components

### 3. Changing Styles
1. **Global styles**: Edit `src/index.css`
2. **Component styles**: Edit Tailwind classes in component files
3. **Theme colors**: Edit `tailwind.config.js`

### 4. Adding New Translations
1. Add keys to `translations` table via admin panel
2. Use `useLanguage()` hook in components
3. Access via `t('your.translation.key')`

### 5. Managing Images
1. **Upload**: Use Image Manager in admin panel
2. **Replace**: Upload new image with same name
3. **Reference**: Update image URLs in database

### 6. Responsive Design Changes
1. **Breakpoints**: Use Tailwind responsive prefixes (sm:, md:, lg:, xl:)
2. **Mobile-first**: Default styles for mobile, add larger screen styles
3. **Test**: Check all breakpoints (640px, 768px, 1024px, 1280px)

### Common File Locations for Modifications

#### Text Content
- Database: `translations` table
- Admin: TranslationsPage.tsx
- Usage: Any component with `useLanguage()` hook

#### Company Information
- Database: `company_details` table
- Admin: CompanyDetailsPopup.tsx
- Display: Header.tsx, Footer.tsx

#### Product Catalog
- Database: `products` table
- Admin: ProductManagerPage.tsx
- Display: Product pages, ProductCard.tsx

#### Contact Forms
- Database: `contact_requests` table
- Frontend: ContactPage.tsx
- Admin: ClientDashboardPage.tsx

#### Navigation
- Main menu: Header.tsx
- Routes: App.tsx
- Admin menu: AdminDashboardPage.tsx

This documentation provides a comprehensive guide to understanding and modifying the ChefGear project. For specific changes, locate the relevant files using this guide and follow the established patterns in the codebase.