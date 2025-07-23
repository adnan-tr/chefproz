import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Factory, 
  Snowflake, 
  ChefHat, 
  Hotel, 
  ArrowRight,
  Star,
  Building2,
  Trophy,
  Target,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { dbService } from '@/lib/supabase';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const [transformationImages, setTransformationImages] = useState<any[]>([]);
  const [productImages, setProductImages] = useState<any[]>([]);
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
        // Fetch limited products for better performance
        const products = await dbService.getProducts(undefined, 0, 50);
        // Filter products that have image URLs and shuffle them
        const productsWithImages = products?.filter(product => 
          product.image_url && product.image_url.trim() !== ''
        ) || [];
        setProductImages(shuffleArray(productsWithImages).slice(0, 8)); // Reduced to 8 products
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
    },
    {
      icon: Snowflake,
      title: t('features.refrigeration.title', 'Refrigeration Systems'),
      description: t('features.refrigeration.description', 'Advanced refrigeration and cooling solutions'),
    },
    {
      icon: ChefHat,
      title: t('features.tools.title', 'Professional Kitchen Tools'),
      description: t('features.tools.description', 'High-quality tools for professional kitchens'),
    },
    {
      icon: Hotel,
      title: t('features.hotel.title', 'Hotel Equipment'),
      description: t('features.hotel.description', 'Comprehensive hotel furniture and serving equipment'),
    },
  ];



  const achievements = [
    {
      icon: Trophy,
      title: t('achievements.leader.title', 'Industry Leader'),
      description: t('achievements.leader.description', 'Recognized as the leading kitchen consultancy in the region'),
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Target,
      title: t('achievements.success.title', '99% Success Rate'),
      description: t('achievements.success.description', 'Exceptional project completion and client satisfaction rate'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Zap,
      title: t('achievements.innovation.title', 'Innovation Award'),
      description: t('achievements.innovation.description', 'Winner of the 2023 Kitchen Innovation Excellence Award'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Building2,
      title: t('achievements.global.title', 'Global Presence'),
      description: t('achievements.global.description', 'Serving clients across 5 continents with local expertise'),
      color: 'from-purple-500 to-purple-600'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Minimalist design with clean typography */}
      <section className="relative text-white overflow-hidden py-16" style={{
        backgroundImage: 'url(https://whlkoratnodmqbmtmtqk.supabase.co/storage/v1/object/public/images//industrial-kitchen.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative px-4 sm:px-6 lg:px-8 z-10 h-full flex flex-col justify-between">
          <div className="text-left max-w-2xl pt-8 sm:pt-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>
          
          {/* CTA Buttons positioned at bottom left on mobile, normal position on larger screens */}
          <div className="absolute bottom-6 left-4 sm:relative sm:bottom-auto sm:left-auto sm:max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                size="sm"
                className="btn-primary px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl sm:px-8 sm:py-4 sm:text-lg w-fit"
                asChild
              >
                <Link to="/contact">
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button
                size="sm"
                className="btn-secondary px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl sm:px-8 sm:py-4 sm:text-lg w-fit"
                asChild
              >
                <Link to="/special-request">
                  {t('hero.services', 'View Services')}
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Slideshow - Glide.js Carousel */}
      <section className="py-16 bg-white">
        <div className="relative">
          <div className="absolute inset-0 bg-white"></div>
          <div className="px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                {t('products.featured', 'Featured Products')}
              </h2>
              <div className="w-20 h-1 bg-red-500 mx-auto"></div>
            </div>
            
            {productsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">{t('products.loading', 'Loading products...')}</p>
              </div>
            ) : productImages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">{t('products.no_images', 'No product images available.')}</p>
              </div>
            ) : (
              <div>
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={20}
                  slidesPerView={2}
                  breakpoints={{
                    320: {
                      slidesPerView: 1,
                      spaceBetween: 10,
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                  }}
                  navigation={{
                    nextEl: '.swiper-button-next-custom',
                    prevEl: '.swiper-button-prev-custom',
                  }}
                  pagination={{
                    clickable: true,
                    bulletClass: 'swiper-pagination-bullet-custom',
                    bulletActiveClass: 'swiper-pagination-bullet-active-custom',
                  }}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  loop={true}
                  className="featured-products-swiper"
                >
                  {productImages.map((product) => (
                    <SwiperSlide key={product.id}>
                      <div className="relative overflow-hidden rounded-xl shadow-lg h-[300px] group">
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-contain bg-white transition-transform duration-500 ease-in-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end">
                          <div className="p-4 text-white w-full transform transition-transform duration-500 ease-out">
                            <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                            <p className="text-xs opacity-90 line-clamp-2">{product.description}</p>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                
                {/* Custom Navigation Buttons */}
                <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Transformation Gallery */}
      <section className="py-20 bg-gray-50">
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

      {/* Product Range */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              {t('products.title')}
            </h2>
            <p className="text-xl text-slate-600">
              {t('products.subtitle', 'Comprehensive solutions for all your industrial kitchen needs')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="elegant-card group">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements Section - Redesigned */}
      <section className="py-20 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              {t('achievements.title', 'Our Achievements & Recognition')}
            </h2>
            <p className="text-xl text-slate-600">
              {t('achievements.subtitle', 'Excellence recognized by industry leaders and satisfied clients worldwide')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card key={index} className="elegant-card group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${achievement.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-red-600 transition-colors">
                          {achievement.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {achievement.description}
                        </p>
                        <div className="flex items-center mt-4 space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="ml-2 text-sm text-slate-500">{t('achievements.rating', 'Excellence Rating')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0"
              asChild
            >
              <Link to="/contact">
                {t('hero.cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-slate-100 border-2 border-slate-300 text-slate-800 hover:bg-slate-200 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
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