# Build Error Fixes Guide

This document provides step-by-step solutions for all 98 TypeScript build errors found during the build process.

## Error Categories

### 1. Unused Import Errors (TS6133)
### 2. Type Mismatch Errors (TS2322, TS2345, TS2365)
### 3. Interface/Property Errors (TS2353, TS2430, TS2339)
### 4. Undefined Property Errors (TS18048, TS7053)
### 5. Unused Import Declaration Errors (TS6192)

---

## Quick Fix Commands

### Step 1: Remove Unused Imports

**File: src/App.tsx**
```typescript
// Remove line 7:
// import AboutPage from './pages/AboutPage';
```

**File: src/components/admin/ServiceAdmin.tsx (and backup files)**
```typescript
// Remove MessageSquare from lucide-react import
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, Download } from 'lucide-react';

// Remove Separator import
// import { Separator } from "@/components/ui/separator";
```

**File: src/components/layout/Header.tsx**
```typescript
// Remove Info and Shield from lucide-react import
// Remove lines 5 and 14
```

**File: src/components/product/ProductFilters.tsx**
```typescript
// Remove Filter from lucide-react import
import { Search, X } from 'lucide-react';
```

**File: src/components/ui/calendar.tsx**
```typescript
// Fix unused props parameters
IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
```

**File: src/components/ui/chart.tsx**
```typescript
// Remove entire unused import block (lines 3-7)
// import {
//   NameType,
//   Payload,
//   ValueType,
// } from 'recharts/types/component/DefaultTooltipContent';
```

### Step 2: Fix Interface and Type Issues

**File: src/components/ui/table.tsx**
```typescript
// Fix TableRowProps interface
interface TableRowProps extends Omit<React.HTMLAttributes<HTMLTableRowElement>, 'onSelect'> {
  isSelected?: boolean;
  isSelectable?: boolean;
  onSelect?: (id: string) => void;
}
```

**File: src/contexts/LanguageContext.tsx**
```typescript
// Remove unused languages import
import { defaultLanguage } from '@/lib/languages';

// Remove unused tableCheck variable (line 398)
// const { data: tableCheck, error: tableError } = await supabase
```

### Step 3: Fix Admin Pages

**File: src/pages/admin/AdminDashboard.tsx**
```typescript
// Remove unused imports
// import { Button } from '@/components/ui/button';
// Remove Eye, Plus from lucide-react import
```

**File: src/pages/admin/AdminUsersPage.tsx**
```typescript
// Remove X from lucide-react import
// Fix line 96 - replace dbService.db with supabase
const { error } = await supabase.from('admin_users').delete().eq('id', id);
```

**File: src/pages/admin/ClientDashboardPage.tsx**
```typescript
// Remove unused imports
// import { Textarea } from '@/components/ui/textarea';
// Remove unused lucide-react imports: Eye, Calendar, ChevronDown, DollarSign, Filter, Package, Activity, BarChart3

// Fix ClientStats interface to include notes
interface ClientStats {
  // ... existing properties
  notes?: string;
}

// Fix priority order indexing
const priorityOrder: { [key: string]: number } = { high: 1, medium: 2, low: 3 };

// Fix selectedClient null check
{selectedClient && (
  <Button
    onClick={() => handleEditClient(selectedClient)}
    // ...
  >
)}

// Remove unused handleViewClient function
```

**File: src/pages/admin/QuotationBuilderPage.tsx**
```typescript
// Remove unused imports from lucide-react
// Remove: Filter, ArrowRight, TrendingUp, CheckSquare, AlertCircle, XCircle, Circle

// Fix newClientData to include usual_discount
setNewClientData({
  company_name: '',
  contact_person: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  usual_discount: 0
});

// Fix discount_percentage type
interface FormData {
  // ... other properties
  discount_percentage: number; // Change from string to number
}

// Fix client_id in formData
interface FormData {
  // ... other properties
  client_id?: string;
}

// Fix selectedClientHistory type
const [selectedClientHistory, setSelectedClientHistory] = useState<any[]>([]);

// Fix discount comparison
{formData.discount_percentage > 0 && (
  // ...
)}

// Fix usual_discount undefined check
{client.usual_discount && client.usual_discount > 0 && (
  // ...
)}

// Remove unused handleSendQuotation function
// Remove unused index parameter in map
```

### Step 4: Fix Product Pages

**Files: HotelEquipmentPage.tsx, InoksanPage.tsx, KitchenToolsPage.tsx, RefrigerationPage.tsx**
```typescript
// Fix subcategories type
const subcategories = Array.from(new Set(
  filteredProducts
    .map(product => product.subcategory)
    .filter((subcat): subcat is string => subcat !== undefined)
));
```

**File: src/components/product/CategoryFilters.tsx**
```typescript
// Update interface to accept optional subcategories
interface CategoryFiltersProps {
  // ... other properties
  subcategories: (string | undefined)[];
}

// Filter undefined values in component
const validSubcategories = subcategories.filter((sub): sub is string => sub !== undefined);
```

### Step 5: Clean Up Remaining Files

**File: src/pages/admin/ClientRequestsPage.tsx**
```typescript
// Remove unused imports: CardHeader, CardTitle, Filter, Trash2, Edit
// Remove unused getStatusIcon function
```

**File: src/pages/admin/ImageManagerPage.tsx**
```typescript
// Remove unused imports: CardHeader, CardTitle, X, ExternalLink
// Remove unused data variable (line 130)
```

**File: src/pages/admin/OrderEditPage.tsx**
```typescript
// Remove unused imports: Calendar, User, Building, FileText, DollarSign, Truck
// Remove unused navigate variable
```

**File: src/pages/admin/OrdersPage.tsx**
```typescript
// Remove unused imports: Eye, Edit, CheckSquare, ChevronDownIcon
// Remove unused variables: setShowFilters, openEditModal, selectedOrderObj
```

**File: src/pages/HomePage.tsx**
```typescript
// Remove unused imports: Utensils, useRef
// Remove unused stats variable
```

**File: src/pages/SpecialRequestPage.tsx**
```typescript
// Remove unused DollarSign import
```

---

## Automated Fix Script

Create a script to automatically apply these fixes:

```bash
# Run TypeScript in strict mode to catch remaining issues
npx tsc --noEmit --strict

# Use ESLint to auto-fix unused imports
npx eslint src/ --fix

# Build the project
npm run build
```

## Priority Order for Fixes

1. **High Priority**: Interface conflicts and type mismatches (prevent compilation)
2. **Medium Priority**: Missing properties and undefined checks (runtime errors)
3. **Low Priority**: Unused imports and variables (code cleanliness)

## Testing After Fixes

1. Run `npm run build` to ensure no compilation errors
2. Run `npm run dev` to test in development
3. Test critical functionality:
   - Admin dashboard
   - Quotation builder
   - Product pages
   - Client management

## Notes

- Some backup files (ServiceAdmin.backup.tsx, etc.) can be deleted if no longer needed
- Consider enabling stricter TypeScript rules gradually
- Use `// @ts-ignore` sparingly and only for temporary fixes
- Update type definitions as the codebase evolves

After applying these fixes, the build should complete successfully with 0 errors.