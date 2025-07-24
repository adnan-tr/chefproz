# Advertisement Brands Management

This document explains how to manage advertisement brands that appear in the moving banners on the Contact page.

## Database Structure

The `advertisement_brands` table contains the following fields:

- `id` (UUID): Unique identifier
- `brand_name` (VARCHAR): Name of the brand/company
- `logo_url` (TEXT): URL to the brand's logo image
- `website_url` (TEXT): Brand's website URL (clickable)
- `description` (TEXT): Short description of the brand
- `contact_email` (VARCHAR): Contact email for the brand
- `contact_phone` (VARCHAR): Contact phone number
- `is_active` (BOOLEAN): Whether the brand is currently displayed
- `display_order` (INTEGER): Order in which brands appear
- `start_date` (TIMESTAMP): When to start showing the brand
- `end_date` (TIMESTAMP): When to stop showing the brand
- `created_at` (TIMESTAMP): Record creation time
- `updated_at` (TIMESTAMP): Last update time

## Setup Instructions

### 1. Initial Database Setup

Run the setup script to create the table and insert sample data:

```bash
npm run setup-ads
```

If the script fails, manually run the SQL in Supabase Dashboard:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the content from: `src/scripts/create_advertisement_brands_table.sql`
5. Run the query

### 2. Managing Brands

#### Adding a New Brand

```sql
INSERT INTO advertisement_brands (
  brand_name, 
  logo_url, 
  website_url, 
  description, 
  contact_email, 
  display_order, 
  is_active
) VALUES (
  'Your Brand Name',
  'https://your-domain.com/logo.png',
  'https://your-brand-website.com',
  'Brief description of your brand',
  'contact@yourbrand.com',
  10,
  true
);
```

#### Updating a Brand

```sql
UPDATE advertisement_brands 
SET 
  brand_name = 'Updated Brand Name',
  logo_url = 'https://new-logo-url.com/logo.png',
  is_active = true
WHERE id = 'brand-uuid-here';
```

#### Deactivating a Brand

```sql
UPDATE advertisement_brands 
SET is_active = false 
WHERE id = 'brand-uuid-here';
```

#### Setting Display Order

```sql
UPDATE advertisement_brands 
SET display_order = 5 
WHERE id = 'brand-uuid-here';
```

#### Setting Time-based Display

```sql
UPDATE advertisement_brands 
SET 
  start_date = '2024-01-01 00:00:00+00',
  end_date = '2024-12-31 23:59:59+00'
WHERE id = 'brand-uuid-here';
```

### 3. Viewing Current Brands

```sql
-- View all active brands
SELECT brand_name, logo_url, website_url, display_order, is_active
FROM advertisement_brands 
WHERE is_active = true 
ORDER BY display_order;

-- View all brands (including inactive)
SELECT brand_name, logo_url, website_url, display_order, is_active, created_at
FROM advertisement_brands 
ORDER BY display_order;
```

## Frontend Implementation

The advertisement brands are displayed using the `AdvertisementBar` component:

- **Top Banner**: Scrolls from right to left
- **Bottom Banner**: Scrolls from left to right
- **Loading State**: Shows placeholder content while loading
- **Error Handling**: Falls back to brand initials if logo fails to load
- **Clickable**: Brands with `website_url` are clickable and open in new tab

## API Service

The `AdvertisementService` provides methods to:

- `getActiveBrands()`: Get all active brands for display
- `getAllBrands()`: Get all brands (for admin management)
- `createBrand()`: Add a new brand
- `updateBrand()`: Update existing brand
- `deleteBrand()`: Delete a brand
- `toggleBrandStatus()`: Toggle active/inactive status
- `updateDisplayOrder()`: Update display order

## Security

- **RLS (Row Level Security)** is enabled
- **Public read access** for active brands only
- **Authenticated access** required for management operations
- **Time-based filtering** respects start_date and end_date

## Best Practices

1. **Logo Images**: Use square images (recommended: 100x100px) for best display
2. **File Formats**: PNG or SVG recommended for logos
3. **Display Order**: Use increments of 10 (10, 20, 30...) to allow easy reordering
4. **Descriptions**: Keep descriptions short (under 50 characters)
5. **Testing**: Always test logo URLs before adding to ensure they load correctly

## Troubleshooting

### Brands Not Showing
1. Check if `is_active = true`
2. Verify `start_date` and `end_date` if set
3. Ensure logo URLs are accessible
4. Check browser console for errors

### Logo Not Loading
1. Verify the logo URL is publicly accessible
2. Check CORS settings if hosting logos externally
3. Ensure image format is supported (PNG, JPG, SVG, WebP)

### Performance Issues
1. Optimize logo image sizes (recommended: under 50KB each)
2. Use CDN for logo hosting
3. Consider lazy loading for many brands

## Example Brands Data

The setup script includes sample brands:
- Premium Kitchen Solutions
- Industrial Chef Pro
- CoolTech Refrigeration
- HotelMax Equipment
- Stainless Steel Masters
- Energy Efficient Systems

You can modify or replace these with real brand data as needed.