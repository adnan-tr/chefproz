import React, { createContext, useContext, useState, useEffect } from 'react';
import { languages, defaultLanguage } from '@/lib/languages';
import { supabase } from '@/lib/supabase';

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Fallback translations in case database fetch fails
const mockTranslations: Record<string, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.contact': 'Contact Us',
    'nav.inoksan': 'Inoksan',
    'nav.refrigeration': 'Refrigeration',
    'nav.kitchen_tools': 'Kitchen Tools',
    'nav.hotel_equipment': 'Hotel Equipment',
    'nav.special_request': 'Special Request',
    'hero.title': 'Professional Kitchen & Catering Solutions',
    'hero.subtitle': 'Expert consultancy for industrial kitchens, hotel equipment, and catering solutions',
    'hero.cta': 'Get Consultation',
    'hero.services': 'View Services',
    'company.overview': 'Leading Industrial Kitchen Consultancy',
    'company.description': 'With over 15 years of experience, we provide comprehensive solutions for industrial kitchens, hotel equipment, and catering services.',
    'products.title': 'Our Product Range',
    'products.search': 'Search products...',
    'products.filter': 'Filter',
    'products.clear': 'Clear Filters',
    'products.add_to_inquiry': 'Add to Inquiry',
    'work.title': 'Our Work in Action',
    'work.subtitle': 'See our professional kitchen solutions in real-world applications',
    'transformations.title': 'Kitchen Transformations',
    'transformations.subtitle': 'Explore our portfolio of professional kitchen solutions',
    'features.industrial.title': 'Industrial Kitchen Solutions',
    'features.industrial.description': 'Complete industrial kitchen design and equipment solutions',
    'features.refrigeration.title': 'Refrigeration Systems',
    'features.refrigeration.description': 'Advanced refrigeration and cooling solutions',
    'features.tools.title': 'Professional Kitchen Tools',
    'features.tools.description': 'High-quality tools for professional kitchens',
    'features.hotel.title': 'Hotel Equipment',
    'features.hotel.description': 'Comprehensive hotel furniture and serving equipment',
    'stats.clients': 'Satisfied Clients',
    'stats.experience': 'Years Experience',
    'stats.countries': 'Countries Served',
    'stats.projects': 'Projects Completed',
    'achievements.leader.title': 'Industry Leader',
    'achievements.leader.description': 'Recognized as the leading kitchen consultancy in the region',
    'achievements.success.title': '99% Success Rate',
    'achievements.success.description': 'Exceptional project completion and client satisfaction rate',
    'achievements.innovation.title': 'Innovation Award',
    'achievements.innovation.description': 'Winner of the 2023 Kitchen Innovation Excellence Award',
    'achievements.global.title': 'Global Presence',
    'achievements.global.description': 'Serving clients across 5 continents with local expertise',
    'cta.title': 'Ready to Elevate Your Kitchen?',
    'cta.subtitle': 'Transform your culinary operations with our expert consultation and premium equipment solutions',
    'cta.services': 'View Services',
    'gallery.before': 'Before',
    'gallery.after': 'After',
    'gallery.solution': 'Kitchen Solution',
    'gallery.description': 'Professional Equipment & Design',
    'contact.form.name': 'Full Name',
    'contact.form.company': 'Company',
    'contact.form.country': 'Country',
    'contact.form.phone': 'Phone',
    'contact.form.email': 'Email',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send Message',
    'footer.quick_links': 'Quick Links',
    'footer.contact_info': 'Contact Information',
    'footer.email': 'Email',
    'footer.phone': 'Phone',
    'footer.address': 'Address',
    'footer.company_email': 'info@chefpro.com',
    'footer.company_phone': '+1 (555) 123-4567',
    'footer.company_address_line1': '123 Business Street',
    'footer.company_address_line2': 'Suite 100',
    'footer.company_address_line3': 'New York, NY 10001',
    'footer.copyright_year': '2024',
    'footer.rights': 'All rights reserved.',
    'footer.privacy_policy': 'Privacy Policy',
    'footer.terms_of_service': 'Terms of Service',
    'footer.cookie_policy': 'Cookie Policy',
    'special_request.page_description': 'Professional services tailored to your specific requirements. From custom kitchen design to specialized installation and ongoing support.',
    'special_request.discuss_project': 'Discuss Your Project',
    'special_request.loading': 'Loading services...',
    'special_request.error': 'Failed to load services. Please try again later.',
    'special_request.try_again': 'Try Again',
    'special_request.no_services': 'No services available at the moment.',
    'special_request.starting_from': 'Starting from',
    'special_request.timeline': 'Timeline:',
    'special_request.included_services': 'Included Services',
    'special_request.get_consultation': 'Get Consultation',
    'special_request.custom_solution': 'Need a Custom Solution?',
    'special_request.custom_solution_description': 'Every project is unique. Let us create a tailored solution that perfectly fits your requirements and budget.'
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.about': 'حولنا',
    'nav.contact': 'اتصل بنا',
    'nav.inoksan': 'إنوكسان',
    'nav.refrigeration': 'التبريد',
    'nav.kitchen_tools': 'أدوات المطبخ',
    'nav.hotel_equipment': 'معدات الفنادق',
    'nav.special_request': 'طلب خاص',
    'hero.title': 'حلول المطابخ المهنية والتموين',
    'hero.subtitle': 'استشارة خبراء للمطابخ الصناعية ومعدات الفنادق وحلول التموين',
    'hero.cta': 'احصل على استشارة',
    'hero.services': 'عرض الخدمات',
    'company.overview': 'استشارات المطابخ الصناعية الرائدة',
    'company.description': 'مع أكثر من 15 عامًا من الخبرة، نقدم حلولاً شاملة للمطابخ الصناعية ومعدات الفنادق وخدمات التموين.',
    'products.title': 'مجموعة منتجاتنا',
    'products.search': 'البحث عن المنتجات...',
    'products.filter': 'تصفية',
    'products.clear': 'مسح المرشحات',
    'products.add_to_inquiry': 'إضافة إلى الاستعلام',
    'work.title': 'أعمالنا قيد التنفيذ',
    'work.subtitle': 'شاهد حلول المطابخ المهنية في التطبيقات الواقعية',
    'transformations.title': 'تحولات المطبخ',
    'transformations.subtitle': 'استكشف محفظتنا من حلول المطابخ المهنية',
    'features.industrial.title': 'حلول المطابخ الصناعية',
    'features.industrial.description': 'حلول شاملة لتصميم وتجهيز المطابخ الصناعية',
    'features.refrigeration.title': 'أنظمة التبريد',
    'features.refrigeration.description': 'حلول متقدمة للتبريد والتجميد',
    'features.tools.title': 'أدوات المطبخ المهنية',
    'features.tools.description': 'أدوات عالية الجودة للمطابخ المهنية',
    'features.hotel.title': 'معدات الفنادق',
    'features.hotel.description': 'معدات شاملة لأثاث الفنادق وخدمة الطعام',
    'stats.clients': 'عملاء راضون',
    'stats.experience': 'سنوات الخبرة',
    'stats.countries': 'البلدان التي نخدمها',
    'stats.projects': 'المشاريع المنجزة',
    'achievements.leader.title': 'رائد الصناعة',
    'achievements.leader.description': 'معترف بنا كشركة استشارات مطابخ رائدة في المنطقة',
    'achievements.success.title': 'معدل نجاح 99٪',
    'achievements.success.description': 'معدل استثنائي لإكمال المشروع ورضا العملاء',
    'achievements.innovation.title': 'جائزة الابتكار',
    'achievements.innovation.description': 'الفائز بجائزة التميز في ابتكار المطابخ لعام 2023',
    'achievements.global.title': 'التواجد العالمي',
    'achievements.global.description': 'خدمة العملاء عبر 5 قارات بخبرة محلية',
    'cta.title': 'هل أنت مستعد لرفع مستوى مطبخك؟',
    'cta.subtitle': 'قم بتحويل عمليات الطهي الخاصة بك مع استشاراتنا الخبيرة وحلول المعدات المتميزة',
    'cta.services': 'عرض الخدمات',
    'gallery.before': 'قبل',
    'gallery.after': 'بعد',
    'gallery.solution': 'حلول المطبخ',
    'gallery.description': 'معدات وتصميم احترافي',
    'contact.form.name': 'الاسم الكامل',
    'contact.form.company': 'الشركة',
    'contact.form.country': 'البلد',
    'contact.form.phone': 'الهاتف',
    'contact.form.email': 'البريد الإلكتروني',
    'contact.form.message': 'الرسالة',
    'contact.form.submit': 'إرسال الرسالة',
    'footer.quick_links': 'روابط سريعة',
    'footer.contact_info': 'معلومات الاتصال',
    'footer.email': 'البريد الإلكتروني',
    'footer.phone': 'الهاتف',
    'footer.address': 'العنوان',
    'footer.company_email': 'info@chefpro.com',
    'footer.company_phone': '+1 (555) 123-4567',
    'footer.company_address_line1': '123 شارع الأعمال',
    'footer.company_address_line2': 'جناح 100',
    'footer.company_address_line3': 'نيويورك، نيويورك 10001',
    'footer.copyright_year': '2024',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.privacy_policy': 'سياسة الخصوصية',
    'footer.terms_of_service': 'شروط الخدمة',
    'footer.cookie_policy': 'سياسة ملفات تعريف الارتباط',
    'special_request.page_description': 'خدمات احترافية مصممة حسب متطلباتك، من تصميم المطبخ إلى التركيب والدعم المستمر.',
    'special_request.discuss_project': 'ناقش مشروعك',
    'special_request.loading': 'جاري تحميل الخدمات...',
    'special_request.error': 'فشل في تحميل الخدمات. يرجى المحاولة مرة أخرى لاحقاً.',
    'special_request.try_again': 'حاول مرة أخرى',
    'special_request.no_services': 'لا توجد خدمات متاحة في الوقت الحالي.',
    'special_request.starting_from': 'ابتداءً من',
    'special_request.timeline': 'الجدول الزمني:',
    'special_request.included_services': 'الخدمات المشمولة',
    'special_request.get_consultation': 'احصل على استشارة',
    'special_request.custom_solution': 'تحتاج حلاً مخصصاً؟',
    'special_request.custom_solution_description': 'كل مشروع فريد. دعنا ننشئ حلاً مخصصاً يناسب متطلباتك وميزانيتك تماماً.'
  },
  tr: {
    'nav.home': 'Ana Sayfa',
    'nav.about': 'Hakkımızda',
    'nav.contact': 'İletişim',
    'nav.inoksan': 'Inoksan',
    'nav.refrigeration': 'Soğutma',
    'nav.kitchen_tools': 'Mutfak Araçları',
    'nav.hotel_equipment': 'Otel Ekipmanları',
    'nav.special_request': 'Özel İstek',
    'hero.title': 'Profesyonel Mutfak ve Catering Çözümleri',
    'hero.subtitle': 'Endüstriyel mutfaklar, otel ekipmanları ve catering çözümleri için uzman danışmanlık',
    'hero.cta': 'Danışmanlık Al',
    'hero.services': 'Hizmetleri Görüntüle',
    'company.overview': 'Lider Endüstriyel Mutfak Danışmanlığı',
    'company.description': '15 yılı aşkın tecrübemizle endüstriyel mutfaklar, otel ekipmanları ve catering hizmetleri için kapsamlı çözümler sunuyoruz.',
    'products.title': 'Ürün Yelpazemiz',
    'products.search': 'Ürün ara...',
    'products.filter': 'Filtrele',
    'products.clear': 'Filtreleri Temizle',
    'products.add_to_inquiry': 'Sorguya Ekle',
    'cta.title': 'Mutfağınızı Yükseltmeye Hazır mısınız?',
    'cta.subtitle': 'Uzman danışmanlığımız ve premium ekipman çözümlerimizle mutfak operasyonlarınızı dönüştürün',
    'cta.services': 'Hizmetleri Görüntüle',
    'gallery.before': 'Önce',
    'gallery.after': 'Sonra',
    'gallery.solution': 'Mutfak Çözümü',
    'gallery.description': 'Profesyonel Ekipman ve Tasarım',
    'contact.form.name': 'Ad Soyad',
    'contact.form.company': 'Şirket',
    'contact.form.country': 'Ülke',
    'contact.form.phone': 'Telefon',
    'contact.form.email': 'E-posta',
    'contact.form.message': 'Mesaj',
    'contact.form.submit': 'Mesaj Gönder',
    'footer.quick_links': 'Hızlı Bağlantılar',
    'footer.contact_info': 'İletişim Bilgileri',
    'footer.email': 'E-posta',
    'footer.phone': 'Telefon',
    'footer.address': 'Adres',
    'footer.company_email': 'info@chefpro.com',
    'footer.company_phone': '+1 (555) 123-4567',
    'footer.company_address_line1': '123 İş Caddesi',
    'footer.company_address_line2': 'Süit 100',
    'footer.company_address_line3': 'New York, NY 10001',
    'footer.copyright_year': '2024',
    'footer.rights': 'Tüm hakları saklıdır.',
    'footer.privacy_policy': 'Gizlilik Politikası',
    'footer.terms_of_service': 'Hizmet Şartları',
    'footer.cookie_policy': 'Çerez Politikası',
    'special_request.page_description': 'Gereksinimlerinize özel profesyonel hizmetler. Özel mutfak tasarımı, kurulum ve sürekli destek.',
    'special_request.discuss_project': 'Projenizi Konuşalım',
    'special_request.loading': 'Hizmetler yükleniyor...',
    'special_request.error': 'Hizmetler yüklenemedi. Lütfen daha sonra tekrar deneyin.',
    'special_request.try_again': 'Tekrar Dene',
    'special_request.no_services': 'Şu anda mevcut hizmet bulunmamaktadır.',
    'special_request.starting_from': 'Başlangıç fiyatı',
    'special_request.timeline': 'Zaman çizelgesi:',
    'special_request.included_services': 'Dahil Edilen Hizmetler',
    'special_request.get_consultation': 'Danışmanlık Al',
    'special_request.custom_solution': 'Özel Bir Çözüme İhtiyacınız Var mı?',
    'special_request.custom_solution_description': 'Her proje benzersizdir. Gereksinimlerinize ve bütçenize mükemmel şekilde uyan özel bir çözüm oluşturalım.'
  },
  es: {
    'nav.home': 'Inicio',
    'nav.about': 'Acerca de',
    'nav.contact': 'Contacto',
    'nav.inoksan': 'Inoksan',
    'nav.refrigeration': 'Refrigeración',
    'nav.kitchen_tools': 'Herramientas de Cocina',
    'nav.hotel_equipment': 'Equipos de Hotel',
    'nav.special_request': 'Solicitud Especial',
    'hero.title': 'Soluciones Profesionales de Cocina y Catering',
    'hero.subtitle': 'Consultoría experta para cocinas industriales, equipos de hotel y soluciones de catering',
    'hero.cta': 'Obtener Consulta',
    'hero.services': 'Ver Servicios',
    'company.overview': 'Consultoría Líder en Cocinas Industriales',
    'company.description': 'Con más de 15 años de experiencia, brindamos soluciones integrales para cocinas industriales, equipos de hotel y servicios de catering.',
    'products.title': 'Nuestra Gama de Productos',
    'products.search': 'Buscar productos...',
    'products.filter': 'Filtrar',
    'products.clear': 'Limpiar Filtros',
    'products.add_to_inquiry': 'Agregar a Consulta',
    'cta.title': '¿Listo para elevar su cocina?',
    'cta.subtitle': 'Transforme sus operaciones culinarias con nuestra consultoría experta y soluciones de equipos premium',
    'cta.services': 'Ver Servicios',
    'gallery.before': 'Antes',
    'gallery.after': 'Después',
    'gallery.solution': 'Solución de Cocina',
    'gallery.description': 'Equipamiento y Diseño Profesional',
    'contact.form.name': 'Nombre Completo',
    'contact.form.company': 'Empresa',
    'contact.form.country': 'País',
    'contact.form.phone': 'Teléfono',
    'contact.form.email': 'Correo Electrónico',
    'contact.form.message': 'Mensaje',
    'contact.form.submit': 'Enviar Mensaje',
    'footer.quick_links': 'Enlaces Rápidos',
    'footer.contact_info': 'Información de Contacto',
    'footer.email': 'Correo Electrónico',
    'footer.phone': 'Teléfono',
    'footer.address': 'Dirección',
    'footer.company_email': 'info@chefpro.com',
    'footer.company_phone': '+1 (555) 123-4567',
    'footer.company_address_line1': '123 Calle de Negocios',
    'footer.company_address_line2': 'Suite 100',
    'footer.company_address_line3': 'Nueva York, NY 10001',
    'footer.copyright_year': '2024',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.privacy_policy': 'Política de Privacidad',
    'footer.terms_of_service': 'Términos de Servicio',
    'footer.cookie_policy': 'Política de Cookies',
    'special_request.page_description': 'Servicios profesionales adaptados a sus requisitos específicos. Desde diseño personalizado hasta instalación especializada y soporte continuo.',
    'special_request.discuss_project': 'Discutir su Proyecto',
    'special_request.loading': 'Cargando servicios...',
    'special_request.error': 'Error al cargar servicios. Por favor, inténtelo de nuevo más tarde.',
    'special_request.try_again': 'Intentar de Nuevo',
    'special_request.no_services': 'No hay servicios disponibles en este momento.',
    'special_request.starting_from': 'Desde',
    'special_request.timeline': 'Cronograma:',
    'special_request.included_services': 'Servicios Incluidos',
    'special_request.get_consultation': 'Obtener Consulta',
    'special_request.custom_solution': '¿Necesita una Solución Personalizada?',
    'special_request.custom_solution_description': 'Cada proyecto es único. Permítanos crear una solución personalizada que se adapte perfectamente a sus requisitos y presupuesto.'
  },
  ru: {
    'nav.home': 'Главная',
    'nav.about': 'О нас',
    'nav.contact': 'Контакты',
    'nav.inoksan': 'Иноксан',
    'nav.refrigeration': 'Холодильное оборудование',
    'nav.kitchen_tools': 'Кухонные принадлежности',
    'nav.hotel_equipment': 'Гостиничное оборудование',
    'nav.special_request': 'Особый запрос',
    'hero.title': 'Профессиональные решения для кухни и кейтеринга',
    'hero.subtitle': 'Экспертные консультации по промышленным кухням, гостиничному оборудованию и кейтеринговым решениям',
    'hero.cta': 'Получить консультацию',
    'hero.services': 'Посмотреть Услуги',
    'company.overview': 'Ведущая консалтинговая компания по промышленным кухням',
    'company.description': 'Имея более 15 лет опыта, мы предоставляем комплексные решения для промышленных кухонь, гостиничного оборудования и кейтеринговых услуг.',
    'products.title': 'Наш ассортимент продукции',
    'products.search': 'Поиск товаров...',
    'products.filter': 'Фильтр',
    'products.clear': 'Очистить фильтры',
    'products.add_to_inquiry': 'Добавить в запрос',
    'cta.title': 'Готовы поднять свою кухню на новый уровень?',
    'cta.subtitle': 'Трансформируйте свои кулинарные операции с помощью нашей экспертной консультации и премиальных решений для оборудования',
    'cta.services': 'Посмотреть Услуги',
    'gallery.before': 'До',
    'gallery.after': 'После',
    'gallery.solution': 'Кухонное Решение',
    'gallery.description': 'Профессиональное Оборудование и Дизайн',
    'contact.form.name': 'Полное имя',
    'contact.form.company': 'Компания',
    'contact.form.country': 'Страна',
    'contact.form.phone': 'Телефон',
    'contact.form.email': 'Электронная почта',
    'contact.form.message': 'Сообщение',
    'contact.form.submit': 'Отправить сообщение',
    'footer.quick_links': 'Быстрые Ссылки',
    'footer.contact_info': 'Контактная Информация',
    'footer.email': 'Электронная Почта',
    'footer.phone': 'Телефон',
    'footer.address': 'Адрес',
    'footer.company_email': 'info@chefpro.com',
    'footer.company_phone': '+1 (555) 123-4567',
    'footer.company_address_line1': '123 Бизнес Стрит',
    'footer.company_address_line2': 'Офис 100',
    'footer.company_address_line3': 'Нью-Йорк, NY 10001',
    'footer.copyright_year': '2024',
    'footer.rights': 'Все права защищены.',
    'footer.privacy_policy': 'Политика Конфиденциальности',
    'footer.terms_of_service': 'Условия Обслуживания',
    'footer.cookie_policy': 'Политика Файлов Cookie',
    'special_request.page_description': 'Профессиональные услуги, адаптированные к вашим требованиям. От индивидуального дизайна кухни до установки и поддержки.',
    'special_request.discuss_project': 'Обсудить Проект',
    'special_request.loading': 'Загрузка услуг...',
    'special_request.error': 'Не удалось загрузить услуги. Пожалуйста, попробуйте позже.',
    'special_request.try_again': 'Попробовать Снова',
    'special_request.no_services': 'В настоящее время услуги недоступны.',
    'special_request.starting_from': 'Начиная с',
    'special_request.timeline': 'Временные рамки:',
    'special_request.included_services': 'Включенные Услуги',
    'special_request.get_consultation': 'Получить Консультацию',
    'special_request.custom_solution': 'Нужно Индивидуальное Решение?',
    'special_request.custom_solution_description': 'Каждый проект уникален. Позвольте нам создать индивидуальное решение, которое идеально подходит вашим требованиям и бюджету.'
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || defaultLanguage;
  });
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(mockTranslations);
  const [isLoading, setIsLoading] = useState(true);

  // Load translations from database
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        
        // First check if translations table exists by trying a simple count query
        const { data: tableCheck, error: tableError } = await supabase
          .from('translations')
          .select('count', { count: 'exact', head: true })
          .limit(1);
        
        if (tableError) {
          console.warn('Translations table not accessible, using fallback translations:', tableError.message);
          setTranslations(mockTranslations);
          return;
        }
        
        // Fetch translations from the column-based table structure (key, en, ar, tr, es, ru)
        const { data: translationsData, error } = await supabase
          .from('translations')
          .select('key, en, ar, tr, es, ru');
        
        if (error) {
          console.warn('Error fetching translations, using fallback:', error.message);
          // Use fallback translations
          setTranslations(mockTranslations);
          return;
        }
        
        // Transform the data into the expected format
        const transformedTranslations: Record<string, Record<string, string>> = {
          en: {},
          ar: {},
          es: {},
          tr: {},
          ru: {}
        };
        
        translationsData?.forEach((item: any) => {
          if (item.key) {
            transformedTranslations.en[item.key] = item.en || item.key;
            transformedTranslations.ar[item.key] = item.ar || item.key;
            transformedTranslations.tr[item.key] = item.tr || item.key;
            transformedTranslations.es[item.key] = item.es || item.key;
            transformedTranslations.ru[item.key] = item.ru || item.key;
          }
        });
        
        // Merge with mock translations to ensure all keys are available
        Object.keys(mockTranslations).forEach(lang => {
          Object.keys(mockTranslations[lang]).forEach(key => {
            if (!transformedTranslations[lang][key]) {
              transformedTranslations[lang][key] = mockTranslations[lang][key];
            }
          });
        });
        
        setTranslations(transformedTranslations);
      } catch (error) {
        console.warn('Error loading translations, using fallback:', error);
        // Fallback to mock translations
        setTranslations(mockTranslations);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, []);

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const t = (key: string, fallback?: string) => {
    // First try the current language
    const currentLangTranslation = translations[currentLanguage]?.[key];
    if (currentLangTranslation) {
      return currentLangTranslation;
    }
    
    // If not found, fallback to English
    const englishTranslation = translations['en']?.[key];
    if (englishTranslation) {
      return englishTranslation;
    }
    
    // If still not found, use provided fallback or the key itself
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};