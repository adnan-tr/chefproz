import { supabase } from './supabase';

export interface AdvertisementBrand {
  id: string;
  brand_name: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  display_order: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export class AdvertisementService {
  // Get active advertisement brands for display
  static async getActiveBrands(): Promise<AdvertisementBrand[]> {
    try {
      const { data, error } = await supabase
        .from('advertisement_brands')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${new Date().toISOString()}`)
        .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching advertisement brands:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching advertisement brands:', error);
      return [];
    }
  }

  // Get all brands (for admin management)
  static async getAllBrands(): Promise<AdvertisementBrand[]> {
    try {
      const { data, error } = await supabase
        .from('advertisement_brands')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching all advertisement brands:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all advertisement brands:', error);
      return [];
    }
  }

  // Create a new brand
  static async createBrand(brand: Omit<AdvertisementBrand, 'id' | 'created_at' | 'updated_at'>): Promise<AdvertisementBrand | null> {
    try {
      const { data, error } = await supabase
        .from('advertisement_brands')
        .insert([brand])
        .select()
        .single();

      if (error) {
        console.error('Error creating advertisement brand:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating advertisement brand:', error);
      return null;
    }
  }

  // Update a brand
  static async updateBrand(id: string, updates: Partial<AdvertisementBrand>): Promise<AdvertisementBrand | null> {
    try {
      const { data, error } = await supabase
        .from('advertisement_brands')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating advertisement brand:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating advertisement brand:', error);
      return null;
    }
  }

  // Delete a brand
  static async deleteBrand(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('advertisement_brands')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting advertisement brand:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting advertisement brand:', error);
      return false;
    }
  }

  // Toggle brand active status
  static async toggleBrandStatus(id: string): Promise<boolean> {
    try {
      // First get the current status
      const { data: currentBrand, error: fetchError } = await supabase
        .from('advertisement_brands')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching brand status:', fetchError);
        return false;
      }

      // Toggle the status
      const { error: updateError } = await supabase
        .from('advertisement_brands')
        .update({ is_active: !currentBrand.is_active })
        .eq('id', id);

      if (updateError) {
        console.error('Error toggling brand status:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error toggling brand status:', error);
      return false;
    }
  }

  // Update display order
  static async updateDisplayOrder(brandOrders: { id: string; display_order: number }[]): Promise<boolean> {
    try {
      const promises = brandOrders.map(({ id, display_order }) =>
        supabase
          .from('advertisement_brands')
          .update({ display_order })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      
      // Check if any updates failed
      const hasError = results.some(result => result.error);
      
      if (hasError) {
        console.error('Error updating display orders');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating display orders:', error);
      return false;
    }
  }
}