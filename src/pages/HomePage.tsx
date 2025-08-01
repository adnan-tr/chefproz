import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import InteractiveHero from '@/components/InteractiveHero';
import { 
  Factory, 
  Snowflake, 
  Utensils, 
  Hotel, 
  ArrowRight,
  Star,
  Building2,
  Trophy,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { dbService } from '@/lib/supabase';
import AccordionSlider from '@/components/AccordionSlider';
import '@/styles/accordion-slider.css';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const [transformationImages, setTransformationImages] = useState<any[]>([]);
  const [accordionImages, setAccordionImages] = useState<{ url: string; title: string; category?: string; subcategory?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  // Removed Glide.js refs as we're using Swiper now

  // Function to shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    console.log('HomePage useEffect running');
    
    // Fetch transformation images from Supabase storage
    const fetchTransformationImages = async () => {
      try {
        const images = await dbService.getTransformationImages();
        setTransformationImages(images);
      } catch (error) {
        console.error('Error fetching transformation images:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch products with images for slideshow - optimized
    const fetchProductsWithImages = async () => {
      try {
        // Fetch more products to ensure we have enough after filtering
        const products = await dbService.getProducts(undefined, 0, 500);
        console.log('Total products fetched:', products?.length || 0);
        
        // Filter products that have image URLs
        const productsWithImages = products?.filter(product => 
          product.image_url && product.image_url.trim() !== ''
        ) || [];
        console.log('Products with images:', productsWithImages.length);
        
        // Shuffle and set products for the main slider
        const shuffledProducts = shuffleArray(productsWithImages);
        
        // Prepare images for accordion slider with category information
        const categories = ['refrigeration', 'inoksan', 'kitchen_tools', 'hotel_equipment'];
        const usedCategories = new Set();
        const usedSubcategories = new Set();
        
        // First pass: try to get one product from each unique subcategory-category combination
        // Group products by subcategory-category combination to avoid duplicates
        const subcategoryGroups: Record<string, any[]> = {};
        
        shuffledProducts.forEach(product => {
          // Skip products without subcategory, category, or image
          if (!product.subcategory || !product.category || !product.image_url || 
              product.subcategory.trim() === '' || product.category.trim() === '') return;
          
          // Create a unique key combining category and subcategory
          const groupKey = `${product.category.toLowerCase()}-${product.subcategory.toLowerCase()}`;
          
          // Create a group for this combination if it doesn't exist
          if (!subcategoryGroups[groupKey]) {
            subcategoryGroups[groupKey] = [];
          }
          
          // Add this product to its group
          subcategoryGroups[groupKey].push(product);
        });
        
        // Take one product from each unique category-subcategory combination
        let accordionSlides: Array<{
          url: string;
          title: string;
          category?: string;
          subcategory?: string;
          productId?: string;
          slug?: string;
        }> = [];
        
        // Randomize the order of category-subcategory groups
        const shuffledGroupKeys = shuffleArray(Object.keys(subcategoryGroups));
        
        shuffledGroupKeys.forEach(groupKey => {
          // Skip if we already have 7 slides
          if (accordionSlides.length >= 7) return;
          
          // Skip if we already used this category
          const [category] = groupKey.split('-');
          if (usedCategories.has(category)) return;
          
          const product = subcategoryGroups[groupKey][0];
          
          // Add this product to our slides
          accordionSlides.push({
            url: product.image_url,
            title: product.name || t('products.item', 'Product'),
            category: product.category || 'default',
            subcategory: product.subcategory,
            productId: product.id,
            slug: product.name?.toLowerCase().replace(/\s+/g, '-')
          });
          
          // Mark this category and subcategory as used
          usedCategories.add(category);
          usedSubcategories.add(product.subcategory);
        });
        
        // If we don't have 7 products yet, try to get one from each category
        if (accordionSlides.length < 7) {
          // Shuffle categories to randomize selection
          const shuffledCategories = shuffleArray([...categories]);
          
          shuffledCategories.forEach(category => {
            // Skip if we already have 7 slides
            if (accordionSlides.length >= 7) return;
            
            // Skip if we already used this category
            if (usedCategories.has(category)) return;
            
            // Find products from this category that we haven't used yet
            const productsFromCategory = shuffledProducts.filter(p => 
              (p.category?.toLowerCase().includes(category) || 
              p.page_reference?.toLowerCase().includes(category)) &&
              !accordionSlides.some(slide => slide.url === p.image_url) &&
              p.image_url && p.image_url.trim() !== '' &&
              (!p.subcategory || !usedSubcategories.has(p.subcategory))
            );
            
            // Take one product from this category if available
            if (productsFromCategory.length > 0) {
              const product = productsFromCategory[0];
              accordionSlides.push({
                url: product.image_url,
                title: product.name || t('products.item', 'Product'),
                category: category,
                subcategory: product.subcategory,
                productId: product.id,
                slug: product.name?.toLowerCase().replace(/\s+/g, '-')
              });
              
              // Mark this category as used
              usedCategories.add(category);
              
              // Mark this subcategory as used if it exists
              if (product.subcategory) {
                usedSubcategories.add(product.subcategory);
              }
            }
          });
        }
        
        // If we still don't have enough products, add more with less strict filtering
        if (accordionSlides.length < 7) {
          console.log('Not enough products yet, adding more with less strict filtering');
          
          // First try with some filtering
          const remainingProducts = shuffledProducts
            .filter(p => 
              // Must have an image
              p.image_url && p.image_url.trim() !== '' &&
              // Must not be already used
              !accordionSlides.some(slide => slide.url === p.image_url)
              // Removed category/subcategory restrictions to get more products
            )
            .slice(0, 7 - accordionSlides.length);
          
          console.log('Found additional products:', remainingProducts.length);
            
          remainingProducts.forEach(product => {
            accordionSlides.push({
              url: product.image_url,
              title: product.name || t('products.item', 'Product'),
              category: product.category || 'default',
              subcategory: product.subcategory || '',
              productId: product.id,
              slug: product.name?.toLowerCase().replace(/\s+/g, '-')
            });
          });
        }
        
        // If we STILL don't have 7 products, add duplicates if necessary
        if (accordionSlides.length < 7 && productsWithImages.length > 0) {
          console.log('Still need more products, adding duplicates if necessary');
          
          // Keep adding products until we reach 7, even if they're duplicates
          while (accordionSlides.length < 7 && productsWithImages.length > 0) {
            // Get a random product from the available ones
            const randomIndex = Math.floor(Math.random() * productsWithImages.length);
            const product = productsWithImages[randomIndex];
            
            accordionSlides.push({
              url: product.image_url,
              title: product.name || t('products.item', 'Product'),
              category: product.category || 'default',
              subcategory: product.subcategory || '',
              productId: product.id,
              slug: product.name?.toLowerCase().replace(/\s+/g, '-')
            });
          }
        }
        
        // Limit to 7 slides and shuffle again to randomize the order
        accordionSlides = shuffleArray(accordionSlides.slice(0, 7));
        console.log('HomePage setting accordionSlides:', accordionSlides.length);
        console.log('HomePage accordionSlides details:', accordionSlides.map(slide => ({
          title: slide.title,
          category: slide.category,
          subcategory: slide.subcategory
        })));
        setAccordionImages(accordionSlides);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchTransformationImages();
    fetchProductsWithImages();
  }, []);

  // Swiper.js handles initialization automatically

  // Handle before/after gallery hover effects
  useEffect(() => {
    const handleHoverEffects = () => {
      const beforeAfterElements = document.querySelectorAll('.before_after');
      
      beforeAfterElements.forEach((wrapper) => {
        const beforeImg = wrapper.querySelector('.img--before');
        const afterImg = wrapper.querySelector('.img--after');
        
        if (beforeImg instanceof HTMLElement) {
          beforeImg.addEventListener('mouseover', () => toggleFocus(beforeImg, true));
          beforeImg.addEventListener('mouseout', () => toggleFocus(beforeImg, false));
        }
        
        if (afterImg instanceof HTMLElement) {
          afterImg.addEventListener('mouseover', () => toggleFocus(afterImg, true));
          afterImg.addEventListener('mouseout', () => toggleFocus(afterImg, false));
        }
      });
    };
    
    const toggleFocus = (element: HTMLElement, toggle: boolean) => {
      const next = element.nextElementSibling as HTMLElement | null;
      const prev = element.previousElementSibling as HTMLElement | null;
      
      // Add focus class to hovered element
      if (toggle) {
        element.classList.add('focus');
      } else {
        element.classList.remove('focus');
      }
      
      // Add unfocus class to adjacent element
      if (next && next.classList.contains('img')) {
        if (toggle) {
          next.classList.add('unfocus');
        } else {
          next.classList.remove('unfocus');
        }
      }
      
      if (prev && prev.classList.contains('img')) {
        if (toggle) {
          prev.classList.add('unfocus');
        } else {
          prev.classList.remove('unfocus');
        }
      }
      
      // Handle divider line visibility
      const dividerLine = element.parentElement?.querySelector('.before_after > div:last-child') as HTMLElement | null;
      if (dividerLine) {
        if (toggle) {
          dividerLine.style.opacity = '0';
        } else {
          dividerLine.style.opacity = '1';
        }
      }
    };
    
    // Initialize hover effects after images are loaded
    if (!loading && transformationImages.length > 0) {
      // Small timeout to ensure DOM is fully rendered
      setTimeout(handleHoverEffects, 500);
    }
    
    return () => {
      // Cleanup event listeners if component unmounts
      const beforeImgs = document.querySelectorAll('.before_after .img--before');
      const afterImgs = document.querySelectorAll('.before_after .img--after');
      
      beforeImgs.forEach((imgElement) => {
        if (imgElement instanceof HTMLElement) {
          imgElement.removeEventListener('mouseover', () => {});
          imgElement.removeEventListener('mouseout', () => {});
        }
      });
      
      afterImgs.forEach((imgElement) => {
        if (imgElement instanceof HTMLElement) {
          imgElement.removeEventListener('mouseover', () => {});
          imgElement.removeEventListener('mouseout', () => {});
        }
      });
    };
  }, [loading, transformationImages]);



  const features = [
    {
      icon: Factory,
      title: t('features.industrial.title', 'Industrial Kitchen Solutions'),
      description: t('features.industrial.description', 'Complete industrial kitchen design and equipment solutions'),
      link: '/inoksan'
    },
    {
      icon: Snowflake,
      title: t('features.refrigeration.title', 'Refrigeration Systems'),
      description: t('features.refrigeration.description', 'Advanced refrigeration and cooling solutions'),
      link: '/refrigeration'
    },
    {
      icon: Utensils,
      title: t('features.tools.title', 'Professional Kitchen Tools'),
      description: t('features.tools.description', 'High-quality tools for professional kitchens'),
      link: '/kitchen-tools'
    },
    {
      icon: Hotel,
      title: t('features.hotel.title', 'Hotel Equipment'),
      description: t('features.hotel.description', 'Comprehensive hotel furniture and serving equipment'),
      link: '/hotel-equipment'
    },
  ];



  const achievements = [
    {
      icon: Trophy,
      title: t('achievements.commitment.title', 'Our Commitment'),
      description: t('achievements.commitment.description', 'Dedicated to delivering exceptional kitchen solutions with unwavering quality standards'),
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Target,
      title: t('achievements.vision.title', 'Our Vision'),
      description: t('achievements.vision.description', 'To become the most trusted partner for professional kitchen design and equipment'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Award,
      title: t('achievements.innovation.title', 'Culinary Excellence'),
      description: t('achievements.innovation.description', 'Crafting dream kitchens where culinary magic comes to life, one masterpiece at a time'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Building2,
      title: t('achievements.expertise.title', 'Expert Team'),
      description: t('achievements.expertise.description', 'Skilled professionals with extensive experience in kitchen design and equipment'),
      color: 'from-purple-500 to-purple-600'
    },
  ];

  // Debug function to force refresh of products
  const forceRefreshProducts = () => {
    console.log('Force refreshing products');
    // Fetch products again
    const fetchProductsAgain = async () => {
      try {
        setProductsLoading(true);
        // Fetch more products to ensure we have enough after filtering
        const products = await dbService.getProducts(undefined, 0, 500);
        console.log('Total products fetched:', products?.length || 0);
        
        // Filter products that have image URLs
        const productsWithImages = products?.filter(product => 
          product.image_url && product.image_url.trim() !== ''
        ) || [];
        console.log('Products with images:', productsWithImages.length);
        
        // Shuffle and set products for the main slider
        const shuffledProducts = shuffleArray(productsWithImages);
        
        // Prepare images for accordion slider with category information
        const categories = ['refrigeration', 'inoksan', 'kitchen_tools', 'hotel_equipment'];
        const usedCategories = new Set();
        const usedSubcategories = new Set();
        
        // First pass: try to get one product from each unique subcategory-category combination
        // Group products by subcategory-category combination to avoid duplicates
        const subcategoryGroups: Record<string, any[]> = {};
        
        shuffledProducts.forEach(product => {
          // Skip products without subcategory, category, or image
          if (!product.subcategory || !product.category || !product.image_url || 
              product.subcategory.trim() === '' || product.category.trim() === '') return;
          
          // Create a unique key combining category and subcategory
          const groupKey = `${product.category.toLowerCase()}-${product.subcategory.toLowerCase()}`;
          
          // Create a group for this combination if it doesn't exist
          if (!subcategoryGroups[groupKey]) {
            subcategoryGroups[groupKey] = [];
          }
          
          // Add this product to its group
          subcategoryGroups[groupKey].push(product);
        });
        
        // Take one product from each unique category-subcategory combination
        let accordionSlides: Array<{
          url: string;
          title: string;
          category?: string;
          subcategory?: string;
          productId?: string;
          slug?: string;
        }> = [];
        
        // Randomize the order of category-subcategory groups
        const shuffledGroupKeys = shuffleArray(Object.keys(subcategoryGroups));
        
        shuffledGroupKeys.forEach(groupKey => {
          // Skip if we already have 7 slides
          if (accordionSlides.length >= 7) return;
          
          // Skip if we already used this category
          const [category] = groupKey.split('-');
          if (usedCategories.has(category)) return;
          
          const product = subcategoryGroups[groupKey][0];
          
          // Add this product to our slides
          accordionSlides.push({
            url: product.image_url,
            title: product.name || t('products.item', 'Product'),
            category: product.category || 'default',
            subcategory: product.subcategory,
            productId: product.id,
            slug: product.name?.toLowerCase().replace(/\s+/g, '-')
          });
          
          // Mark this category and subcategory as used
          usedCategories.add(category);
          usedSubcategories.add(product.subcategory);
        });
        
        // If we don't have 7 products yet, try to get one from each category
        if (accordionSlides.length < 7) {
          // Shuffle categories to randomize selection
          const shuffledCategories = shuffleArray([...categories]);
          
          shuffledCategories.forEach(category => {
            // Skip if we already have 7 slides
            if (accordionSlides.length >= 7) return;
            
            // Skip if we already used this category
            if (usedCategories.has(category)) return;
            
            // Find products from this category that we haven't used yet
            const productsFromCategory = shuffledProducts.filter(p => 
              (p.category?.toLowerCase().includes(category) || 
              p.page_reference?.toLowerCase().includes(category)) &&
              !accordionSlides.some(slide => slide.url === p.image_url) &&
              p.image_url && p.image_url.trim() !== '' &&
              (!p.subcategory || !usedSubcategories.has(p.subcategory))
            );
            
            // Take one product from this category if available
            if (productsFromCategory.length > 0) {
              const product = productsFromCategory[0];
              accordionSlides.push({
                url: product.image_url,
                title: product.name || t('products.item', 'Product'),
                category: category,
                subcategory: product.subcategory,
                productId: product.id,
                slug: product.name?.toLowerCase().replace(/\s+/g, '-')
              });
              
              // Mark this category as used
              usedCategories.add(category);
              
              // Mark this subcategory as used if it exists
              if (product.subcategory) {
                usedSubcategories.add(product.subcategory);
              }
            }
          });
        }
        
        // If we still don't have enough products, add more with less strict filtering
        if (accordionSlides.length < 7) {
          console.log('Not enough products yet, adding more with less strict filtering');
          
          // First try with some filtering
          const remainingProducts = shuffledProducts
            .filter(p => 
              // Must have an image
              p.image_url && p.image_url.trim() !== '' &&
              // Must not be already used
              !accordionSlides.some(slide => slide.url === p.image_url)
              // Removed category/subcategory restrictions to get more products
            )
            .slice(0, 7 - accordionSlides.length);
          
          console.log('Found additional products:', remainingProducts.length);
            
          remainingProducts.forEach(product => {
            accordionSlides.push({
              url: product.image_url,
              title: product.name || t('products.item', 'Product'),
              category: product.category || 'default',
              subcategory: product.subcategory || '',
              productId: product.id,
              slug: product.name?.toLowerCase().replace(/\s+/g, '-')
            });
          });
        }
        
        // If we STILL don't have 7 products, add duplicates if necessary
        if (accordionSlides.length < 7 && productsWithImages.length > 0) {
          console.log('Still need more products, adding duplicates if necessary');
          
          // Keep adding products until we reach 7, even if they're duplicates
          while (accordionSlides.length < 7 && productsWithImages.length > 0) {
            // Get a random product from the available ones
            const randomIndex = Math.floor(Math.random() * productsWithImages.length);
            const product = productsWithImages[randomIndex];
            
            accordionSlides.push({
              url: product.image_url,
              title: product.name || t('products.item', 'Product'),
              category: product.category || 'default',
              subcategory: product.subcategory || '',
              productId: product.id,
              slug: product.name?.toLowerCase().replace(/\s+/g, '-')
            });
          }
        }
        
        // Limit to 7 slides and shuffle again to randomize the order
        accordionSlides = shuffleArray(accordionSlides.slice(0, 7));
        console.log('HomePage setting accordionSlides:', accordionSlides.length);
        console.log('HomePage accordionSlides details:', accordionSlides.map(slide => ({
          title: slide.title,
          category: slide.category,
          subcategory: slide.subcategory
        })));
        setAccordionImages(accordionSlides);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductsLoading(false);
      }
    };
    
    fetchProductsAgain();
  };

  return (
    <div className="min-h-screen">
      {/* Interactive Hero Section */}
      <InteractiveHero />

      {/* Product Range */}
      <section className="py-20 bg-slate-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              {t('products.title')}
            </h2>
            <p className="text-xl text-slate-600">
              {t('products.subtitle', 'Comprehensive solutions for all your industrial kitchen needs')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} to={feature.link} className="block h-full">
                  <Card className="elegant-card group cursor-pointer hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <CardContent className="p-6 text-center flex-1 flex flex-col justify-between min-h-[280px]">
                      <div className="flex flex-col items-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-sm line-clamp-3 flex-1 flex items-center justify-center">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Accordion Slider Section - Featured Products */}
      <section className="py-16 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              {t('products.featured', 'Featured Products')}
            </h2>
            <div className="w-20 h-1 bg-red-500 mx-auto mb-4"></div>
            <button 
              onClick={forceRefreshProducts}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Refresh Products
            </button>
          </div>
          
          {productsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">{t('products.loading', 'Loading products...')}</p>
            </div>
          ) : accordionImages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">{t('products.no_images', 'No product images available.')}</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-sm text-slate-600">Displaying {accordionImages.length} products</p>
              </div>
              <AccordionSlider images={accordionImages} />
            </>
          )}
        </div>
      </section>

      {/* Achievements Section - Enhanced for Trust Building */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="px-2 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">
              {t('achievements.title', 'Why Choose Hublinq')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto px-4">
                {t('achievements.subtitle', 'Excellence recognized by industry leaders and satisfied clients worldwide. Your trusted partner for professional kitchen solutions. We speak many native languages to serve our diverse clientele.')}
              </p>
            <div className="flex flex-col sm:flex-row justify-center items-center mt-6 sm:mt-8 space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">500+</div>
                <div className="text-xs sm:text-sm text-slate-600">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">15+</div>
                <div className="text-xs sm:text-sm text-slate-600">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">98%</div>
                <div className="text-xs sm:text-sm text-slate-600">Client Satisfaction</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card key={index} className="elegant-card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-lg">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4 lg:space-x-6">
                      <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${achievement.color} rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-2 sm:mb-3 group-hover:text-red-600 transition-colors">
                          {achievement.title}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3 sm:mb-4">
                          {achievement.description}
                        </p>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="ml-2 text-xs sm:text-sm text-slate-500">{t('achievements.rating', 'Quality Promise')}</span>
                        </div>
                        <div className="mt-2 sm:mt-3 text-xs text-red-600 font-semibold">
                          ✓ Passion-Driven & Heart-Crafted
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Why Choose Hublinq?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-800">Quality Guaranteed</h4>
                  <p className="text-sm text-slate-600">Premium materials & craftsmanship</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-800">On-Time Delivery</h4>
                  <p className="text-sm text-slate-600">Reliable project completion</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75c0-5.385-4.365-9.75-9.75-9.75z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-800">24/7 Support</h4>
                  <p className="text-sm text-slate-600">Ongoing maintenance & service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transformation Gallery */}
      <section className="py-20 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">{t('transformations.title', 'Kitchen Transformations')}</h2>
            <p className="text-xl text-slate-600">{t('transformations.subtitle', 'Explore our portfolio of professional kitchen solutions')}</p>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">{t('gallery.loading', 'Loading gallery...')}</p>
            </div>
          ) : transformationImages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">{t('gallery.no_images', 'No images found. Add images to the \'trans\' folder in Supabase storage.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {transformationImages.reduce((pairs: any[], image, index) => {
                if (index % 2 === 0) {
                  const beforeImage = image;
                  const afterImage = transformationImages[index + 1];
                  
                  if (afterImage) {
                    pairs.push(
                      <div key={`pair-${index}`} className="before_after relative aspect-video overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                        {/* Before Image */}
                        <div className="img img--before absolute inset-0 w-full h-full">
                          <div 
                            className="img__bg w-full h-full bg-cover bg-center transition-all duration-500"
                            style={{ backgroundImage: `url(${beforeImage.url})` }}
                          ></div>
                        </div>
                        {/* After Image */}
                        <div className="img img--after absolute inset-0 w-1/2 overflow-hidden transition-all duration-500">
                          <div 
                            className="img__bg w-full h-full bg-cover bg-center transition-all duration-500"
                            style={{ backgroundImage: `url(${afterImage.url})` }}
                          ></div>
                        </div>
                        {/* Content Labels */}
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
                          {t('gallery.before', 'Before')}
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
                          {t('gallery.after', 'After')}
                        </div>
                        {/* Divider Line */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white shadow-lg transition-all duration-500 pointer-events-none"></div>
                      </div>
                    );
                   } else {
                    // Single image case
                    pairs.push(
                      <div key={`single-${index}`} className="before_after relative aspect-video overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                        <div className="img img--single absolute inset-0 w-full h-full">
                          <div 
                            className="img__bg w-full h-full bg-cover bg-center transition-all duration-500"
                            style={{ backgroundImage: `url(${beforeImage.url})` }}
                          ></div>
                        </div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-white text-center">
                            <h3 className="text-lg font-semibold mb-2">{t('gallery.solution', 'Kitchen Solution')}</h3>
                            <p className="text-sm opacity-90">{t('gallery.description', 'Professional Equipment & Design')}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                }
                return pairs;
              }, [])}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section with Abstract Background */}
      <section className="py-20 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-white"></div>
        
        <div className="relative px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
            {t('cta.title', 'Ready to Elevate Your Kitchen?')}
          </h2>
          <p className="text-xl mb-10 text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('cta.subtitle', 'Transform your culinary operations with our expert consultation and premium equipment solutions')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 border-0"
              asChild
            >
              <Link to="/contact">
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-slate-100 border-2 border-slate-300 text-slate-800 hover:bg-slate-200 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              asChild
            >
              <Link to="/special-request">
                {t('cta.services', 'View Services')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;