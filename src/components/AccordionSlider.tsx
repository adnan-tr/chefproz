import React, { useEffect, useState, useRef } from 'react';
import { X, Package, Tag, ChefHat, Utensils, Flame, Snowflake, Coffee, Shirt, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '@/styles/accordion-slider.css';

interface AccordionSliderProps {
  images: {
    url: string;
    title: string;
    category?: string;
    subcategory?: string;
    productId?: string;
    slug?: string;
  }[];
}

const AccordionSlider: React.FC<AccordionSliderProps> = ({ images }) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [slideWidth, setSlideWidth] = useState(0);
  const [previewWidth, setPreviewWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const autoTriggerRef = useRef<NodeJS.Timeout>();

  // Function to get category-specific icon
  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('knife') || categoryLower.includes('knives') || categoryLower.includes('cutlery')) {
      return <Utensils className="h-5 w-5 text-white mb-1" />;
    } else if (categoryLower.includes('uniform') || categoryLower.includes('apparel') || categoryLower.includes('clothing')) {
      return <Shirt className="h-5 w-5 text-white mb-1" />;
    } else if (categoryLower.includes('cooking') || categoryLower.includes('stove') || categoryLower.includes('oven') || categoryLower.includes('grill')) {
      return <Flame className="h-5 w-5 text-white mb-1" />;
    } else if (categoryLower.includes('refriger') || categoryLower.includes('freezer') || categoryLower.includes('cooling')) {
      return <Snowflake className="h-5 w-5 text-white mb-1" />;
    } else if (categoryLower.includes('coffee') || categoryLower.includes('beverage') || categoryLower.includes('drink')) {
      return <Coffee className="h-5 w-5 text-white mb-1" />;
    } else if (categoryLower.includes('chef') || categoryLower.includes('kitchen')) {
      return <ChefHat className="h-5 w-5 text-white mb-1" />;
    } else if (categoryLower.includes('tool') || categoryLower.includes('equipment') || categoryLower.includes('machine')) {
      return <Wrench className="h-5 w-5 text-white mb-1" />;
    } else {
      return <Package className="h-5 w-5 text-white mb-1" />;
    }
  };

  // Filter out images without URLs and duplicate categories/subcategories

  // Filter out images without URLs but keep all products passed from HomePage
  // Don't slice to 7 as HomePage already handles this
  const validImages = images
    .filter(image => image.url && image.url.trim() !== ''); // Only filter out items with no picture
    
  console.log('AccordionSlider received images:', images.length);
  console.log('AccordionSlider validImages:', validImages.length);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current || validImages.length === 0) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      setContainerWidth(containerWidth);
      
      // Responsive preview width
      let previewWidth;
      if (window.innerWidth < 640) { // sm
        previewWidth = 30;
      } else if (window.innerWidth < 768) { // md
        previewWidth = 40;
      } else if (window.innerWidth < 1024) { // lg
        previewWidth = 50;
      } else {
        previewWidth = 60;
      }
      setPreviewWidth(previewWidth);
      
      // Calculate slide width based on container width and number of slides
      const calculatedSlideWidth = containerWidth / validImages.length;
      setSlideWidth(calculatedSlideWidth);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [validImages.length, containerRef]);

  // Auto-trigger functionality
  useEffect(() => {
    const startAutoTrigger = () => {
      autoTriggerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % validImages.length);
      }, 3000); // Change slide every 3 seconds
    };

    const stopAutoTrigger = () => {
      if (autoTriggerRef.current) {
        clearInterval(autoTriggerRef.current);
      }
    };

    startAutoTrigger();

    return () => stopAutoTrigger();
  }, [validImages.length]);

  // Apply slide transformations based on current slide
  useEffect(() => {
    if (!containerRef.current) return;
    
    const slides = containerRef.current.querySelectorAll('.aviaccordion-slide');
    
    slides.forEach((slide, i) => {
      const slideElement = slide as HTMLElement;
      if (i < currentSlide) {
        // Slides before current slide
        slideElement.style.transform = `translateX(${i * previewWidth}px)`;
        slideElement.style.width = `${previewWidth}px`;
      } else if (i === currentSlide) {
        // Current slide (expanded)
        slideElement.style.transform = `translateX(${i * previewWidth}px)`;
        slideElement.style.width = `${containerWidth - (previewWidth * (validImages.length - 1))}px`;
      } else {
        // Slides after current slide
        slideElement.style.transform = `translateX(${containerWidth - (previewWidth * (validImages.length - i))}px)`;
        slideElement.style.width = `${previewWidth}px`;
      }
    });
  }, [currentSlide, containerWidth, previewWidth, validImages.length]);

  const handleMouseEnter = (index: number) => {
    // Stop auto-trigger when user hovers
    if (autoTriggerRef.current) {
      clearInterval(autoTriggerRef.current);
    }
    setCurrentSlide(index);
  };

  const handleMouseLeave = () => {
    // Restart auto-trigger when user stops hovering
    autoTriggerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % validImages.length);
    }, 3000);
  };

  const handleTouchStart = (index: number) => {
    // For mobile devices, trigger on touch
    if (autoTriggerRef.current) {
      clearInterval(autoTriggerRef.current);
    }
    setCurrentSlide(index);
  };

  const handleImageClick = (e: React.MouseEvent, imageUrl: string) => {
    e.preventDefault();
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const handleSectionClick = (e: React.MouseEvent, image: any) => {
    e.preventDefault();
    
    // On mobile, just show the image modal instead of navigating
    if (window.innerWidth < 640) {
      setSelectedImage(image.url);
      setIsModalOpen(true);
      return;
    }
    
    // On desktop, navigate to the product category page
    const categoryName = image.subcategory || image.category || image.title;
    const slug = categoryName.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    navigate(`/products/${slug}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage('');
  };

  return (
    <>
      <div className="aviaccordion-container" ref={containerRef}>
        <div className="aviaccordion-inner">
          {validImages.map((image, index) => (
            <div 
              key={index}
              className="aviaccordion-slide"
              style={{
                width: `${slideWidth}px`,
                transform: `translateX(${index * slideWidth}px)`,
                left: 0
              }}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onTouchStart={() => handleTouchStart(index)}
            >
              <div 
                className="aviaccordion-slide-link cursor-pointer relative" 
                onClick={(e) => handleSectionClick(e, image)}
              >
                <img 
                  src={image.url} 
                  alt={image.title} 
                  className="aviaccordion-image"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick(e, image.url);
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x600?text=Chef+Gear+Product';
                  }}
                />
                
                {/* Text overlay - only show when active/expanded */}
                {index === currentSlide && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 text-white">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <Package className="h-5 w-5" />
                        <h3 className="text-lg md:text-xl font-bold">
                          {image.title || `${image.category} - ${image.subcategory}`}
                        </h3>
                      </div>
                      
                      {/* Hide category/subcategory on mobile devices */}
                      {image.category && image.subcategory && (
                        <div className="hidden sm:flex items-center justify-center space-x-2 text-sm opacity-90">
                          <Tag className="h-4 w-4" />
                          <span className="bg-red-600/20 px-2 py-1 rounded">{image.category}</span>
                          <span>•</span>
                          <span className="bg-blue-600/20 px-2 py-1 rounded">{image.subcategory}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Preview text - show when not active, smaller text and always at bottom */}
                <div 
                  className={`aviaccordion-preview ${index === currentSlide ? 'opacity-0' : 'opacity-100'}`}
                  style={{ width: `${previewWidth}px` }}
                >
                  <div className="aviaccordion-preview-title-pos">
                    <div className="text-center flex flex-col items-center justify-end h-full space-y-1 pb-2">
                      {/* Dynamic icon based on category - smaller on mobile */}
                      <div className="text-white mb-1">
                        {getCategoryIcon(image.category || 'default')}
                      </div>
                      <h3 className="aviaccordion-title text-xs font-bold text-white leading-tight">
                        {image.category ? (image.category.charAt(0).toUpperCase() + image.category.slice(1).toLowerCase()) : 'Product'}
                      </h3>
                      {image.subcategory && (
                        <p className="aviaccordion-title text-xs font-medium text-white/80 leading-tight">
                          {image.subcategory ? (image.subcategory.charAt(0).toUpperCase() + image.subcategory.slice(1).toLowerCase()) : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for enlarged image */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedImage}
              alt="Product"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AccordionSlider;