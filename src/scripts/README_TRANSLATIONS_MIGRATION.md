# Translations Table Migration

This document explains the translation table structure issue and how to fix it.

## The Problem

There is a mismatch between how the translations table is created and how it's accessed in the application:

1. **Current Table Structure** (created by `populateTranslations.cjs`):
   ```sql
   CREATE TABLE translations (
     id UUID PRIMARY KEY,
     key TEXT UNIQUE NOT NULL,
     en TEXT,
     ru TEXT,
     es TEXT,
     tr TEXT,
     ar TEXT,
     created_at TIMESTAMP WITH TIME ZONE,
     updated_at TIMESTAMP WITH TIME ZONE
   );
   ```

2. **Expected Table Structure** (used by `LanguageContext.tsx` and `supabase.ts`):
   ```sql
   CREATE TABLE translations (
     id UUID PRIMARY KEY,
     key TEXT NOT NULL,
     language_code TEXT NOT NULL,
     value TEXT,
     created_at TIMESTAMP WITH TIME ZONE,
     updated_at TIMESTAMP WITH TIME ZONE,
     UNIQUE(key, language_code)
   );
   ```

## The Solution

We've created a migration script (`migrateTranslationsTable.cjs`) that will:

1. Create a backup of the current translations table
2. Create a new table with the correct structure
3. Transform and migrate the data from the old structure to the new structure
4. Swap the tables

## How to Run the Migration

1. Make sure you have Node.js installed
2. Navigate to the project root directory
3. Run the migration script:

```bash
node src/scripts/migrateTranslationsTable.cjs
```

## What to Expect

The script will output progress information as it runs. When completed successfully, you should see:

```
Migration completed successfully!
The original data is still available in translations_backup if needed.
```

## Rollback (if needed)

If something goes wrong, you can restore the original table from the backup:

```sql
DROP TABLE IF EXISTS translations;
ALTER TABLE translations_backup RENAME TO translations;
```

## After Migration

After running the migration, the application should work correctly with the new table structure. The `TranslationsPage.tsx` component will be able to manage translations, and the `LanguageContext.tsx` will be able to load them properly.

## Future Considerations

To prevent this issue from happening again:

1. We've created an updated script `populateTranslationsUpdated.cjs` that uses the new table structure
2. Make sure all components that interact with the translations table use the same structure
3. Consider adding database migrations to your development workflow

## Using the Updated Population Script

An updated version of the translations population script has been created as `populateTranslationsUpdated.cjs`. This script:

1. Uses the new table structure with `key`, `language_code`, and `value` columns
2. Transforms the original translation data format to the new format
3. Ensures all future runs will maintain the correct table structure

To use the updated script instead of the original:

```bash
node src/scripts/populateTranslationsUpdated.cjs
```

This will ensure that any future data population maintains the correct table structure that matches the application's expectations.