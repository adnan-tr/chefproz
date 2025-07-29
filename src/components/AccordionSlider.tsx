import React, { useEffect, useState, useRef } from 'react';
import '@/styles/accordion-slider.css';

interface AccordionSliderProps {
  images: {
    url: string;
    title: string;
    category?: string;
    subcategory?: string;
    productId?: string; // Add productId for navigation
    slug?: string; // Add slug for navigation
  }[];
}

const AccordionSlider: React.FC<AccordionSliderProps> = ({ images }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [slideWidth, setSlideWidth] = useState(0);
  const [previewWidth, setPreviewWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current || images.length === 0) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      setContainerWidth(containerWidth);
      
      // Preview width is fixed for the title area, but smaller on mobile
      const previewWidth = window.innerWidth < 768 ? 40 : 60;
      setPreviewWidth(previewWidth);
      
      // Calculate slide width based on container width and number of slides
      const calculatedSlideWidth = containerWidth / images.length;
      setSlideWidth(calculatedSlideWidth);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [images.length, containerRef]);

  const handleMouseEnter = (index: number) => {
    if (!containerRef.current) return;
    
    const slides = containerRef.current.querySelectorAll('.aviaccordion-slide');
    
    slides.forEach((slide, i) => {
      const slideElement = slide as HTMLElement;
      if (i < index) {
        // Slides before hovered slide
        slideElement.style.transform = `translateX(${i * previewWidth}px)`;
      } else if (i === index) {
        // Hovered slide
        slideElement.style.transform = `translateX(${i * previewWidth}px)`;
        slideElement.style.width = `${containerWidth - (previewWidth * (images.length - 1))}px`;
      } else {
        // Slides after hovered slide
        slideElement.style.transform = `translateX(${containerWidth - (previewWidth * (images.length - i))}px)`;
      }
    });
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    
    const slides = containerRef.current.querySelectorAll('.aviaccordion-slide');
    
    slides.forEach((slide, i) => {
      const slideElement = slide as HTMLElement;
      slideElement.style.transform = `translateX(${i * slideWidth}px)`;
      slideElement.style.width = `${slideWidth}px`;
    });
  };

  return (
    <div className="aviaccordion-container" ref={containerRef}>
      <div className="aviaccordion-inner">
        {images.map((image, index) => (
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
          >
            <a 
              className="aviaccordion-slide-link" 
              href={image.productId ? `/product/${image.productId}${image.slug ? `/${image.slug}` : ''}` : '#'}
              onClick={(e) => {
                if (!image.productId) {
                  e.preventDefault();
                }
              }}
            >
              <div 
                className="aviaccordion-preview"
                style={{ width: `${previewWidth}px` }}
              >
                <div className="aviaccordion-preview-title-pos">
                <h3 className="aviaccordion-title">
                  {image.subcategory && image.category 
                    ? `${image.category} - ${image.subcategory}` 
                    : image.subcategory || image.category || image.title}
                </h3>
              </div>
              </div>
              <img 
                src={image.url} 
                alt={image.title} 
                className="aviaccordion-image"
                style={{ width: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  // If image fails to load, replace with a placeholder
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/800x600?text=Chef+Gear+Product';
                }}
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccordionSlider;