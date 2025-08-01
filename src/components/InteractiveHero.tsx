import React, { useState, useEffect } from 'react';
import { Factory, ChefHat, PenTool, Hotel, Waves } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

const InteractiveHero: React.FC = () => {
  const { t } = useLanguage();
  const [activePane, setActivePane] = useState(0);
  const [heroImages, setHeroImages] = useState<string[]>([]);

  const panes = [
    {
      icon: Factory,
      title: t('hero.panes.industrial.title', 'Industrial Equipment'),
      description: t('hero.panes.industrial.description', 'Professional kitchen solutions for large-scale operations'),
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500',
      imageIndex: 0
    },
    {
      icon: ChefHat,
      title: t('hero.panes.buffet.title', 'Open Buffet Design'),
      description: t('hero.panes.buffet.description', 'Complete buffet solutions for hotels and restaurants'),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500',
      imageIndex: 1
    },
    {
      icon: PenTool,
      title: t('hero.panes.planning.title', 'AutoCAD Planning'),
      description: t('hero.panes.planning.description', 'Custom kitchen design & planning services'),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500',
      imageIndex: 2
    },
    {
      icon: Hotel,
      title: t('hero.panes.horeca.title', 'HORECA Solutions'),
      description: t('hero.panes.horeca.description', 'Complete solutions for hotels, restaurants & catering'),
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500',
      imageIndex: 3
    },
    {
      icon: Waves,
      title: t('hero.panes.dishwasher.title', 'Dishwasher Area'),
      description: t('hero.panes.dishwasher.description', 'Professional dishwashing and cleaning solutions'),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500',
      imageIndex: 4
    }
  ];

  // Fetch hero images from Supabase
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const imageUrls: string[] = [];
        
        for (let i = 1; i <= 5; i++) {
          const { data } = supabase.storage
            .from('images')
            .getPublicUrl(`hero/${i}.jpg`);
          
          if (data?.publicUrl) {
            imageUrls.push(data.publicUrl);
          }
        }
        
        setHeroImages(imageUrls);
      } catch (error) {
        console.error('Error fetching hero images:', error);
      }
    };

    fetchHeroImages();
  }, []);

  // Auto-rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePane((prev) => (prev + 1) % panes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [panes.length]);

  return (
    <section className="relative h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden bg-gradient-to-b from-black to-[#0f1011]">
      <div className="flex h-full p-1 sm:p-2">
        {panes.map((pane, index) => {
          const Icon = pane.icon;
          const isActive = index === activePane;
          const backgroundImage = heroImages[pane.imageIndex];
          
          return (
            <div
              key={index}
              className={`pane relative cursor-pointer transition-all duration-700 ease-in-out m-1 sm:m-2 min-h-[3rem] min-w-[3rem] sm:min-h-[3.5rem] sm:min-w-[3.5rem] overflow-hidden rounded-2xl sm:rounded-3xl ${
                isActive ? 'flex-grow-[10] active' : 'flex-grow'
              }`}
              onClick={() => setActivePane(index)}
              onMouseEnter={() => setActivePane(index)}
            >
              {/* Background with image - no zoom effect */}
              {backgroundImage ? (
                <img 
                  src={backgroundImage}
                  alt={pane.title}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out z-10"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                />
              ) : (
                <div 
                  className={`background absolute inset-0 bg-gradient-to-br ${pane.color} transition-all duration-700 ease-in-out z-10`}
                />
              )}
              
              {/* Shadow overlay */}
              <div className={`shadow absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent transition-all duration-700 ease-in-out z-20 ${
                isActive ? 'opacity-75 translate-y-0' : 'opacity-0 translate-y-1/2'
              }`} />
              
              {/* Content */}
              <div className="label absolute bottom-0 left-0 flex transition-all duration-700 ease-in-out z-30 mb-2 ml-2 sm:mb-3 sm:ml-3 md:mb-4 md:ml-4">
                {/* Icon container */}
                <div className={`icon bg-[#0f1011] flex items-center justify-center mr-2 sm:mr-3 md:mr-4 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12' 
                    : 'h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16'
                }`}>
                  <Icon className={`transition-all duration-300 ${
                    isActive 
                      ? `h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${pane.color.includes('red') ? 'text-red-500' : pane.color.includes('yellow') ? 'text-yellow-500' : pane.color.includes('green') ? 'text-green-500' : pane.color.includes('blue') ? 'text-blue-500' : 'text-purple-500'}`
                      : `h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 ${pane.color.includes('red') ? 'text-red-500' : pane.color.includes('yellow') ? 'text-yellow-500' : pane.color.includes('green') ? 'text-green-500' : pane.color.includes('blue') ? 'text-blue-500' : 'text-purple-500'}`
                  }`} />
                </div>
                
                {/* Text content */}
                <div className="content flex flex-col justify-center leading-tight text-white whitespace-pre">
                  <div className={`font-bold transition-all duration-700 ease-in-out relative ${
                    isActive 
                      ? 'opacity-100 translate-x-0 text-sm sm:text-base md:text-lg lg:text-xl' 
                      : 'opacity-0 translate-x-8 text-base sm:text-lg md:text-xl lg:text-2xl'
                  }`}>
                    {pane.title}
                  </div>
                  <div className={`transition-all duration-700 ease-in-out delay-100 relative ${
                    isActive 
                      ? 'opacity-100 translate-x-0 text-xs sm:text-sm md:text-base' 
                      : 'opacity-0 translate-x-8 text-sm sm:text-base md:text-lg'
                  }`}>
                    {isActive ? pane.description : pane.title}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Indicators - Hidden as requested */}
      <div className="hidden absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-40">
        {panes.map((_, index) => (
          <button
            key={index}
            onClick={() => setActivePane(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === activePane 
                ? 'bg-white' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default InteractiveHero;