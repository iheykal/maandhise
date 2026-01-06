import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  // CreditCard, 
  // GraduationCap, 
  // Users, 
  // TrendingUp,
  ArrowRight,
  // Star,
  // CheckCircle,
  // Globe,
  // Shield
  Building2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { companyService } from '../services/companyService.ts';

const HomePage: React.FC = () => {
  const { language } = useTheme();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [companies, setCompanies] = useState<any[]>([]);

  // Gallery images (same as in GalleryPage) - all images from icons folder
  const galleryImages = [
    // Original numbered images
    '1.jpeg',
    '2.jpeg',
    '3.jpeg',
    '4.jpeg',
    '5.jpeg',
    '6.jpeg',
    // Facebook event images
    '489577276_1242317374568893_4520953705150057931_n.jpg',
    '489776852_1243241001143197_2484832212153513724_n.jpg',
    '491830696_1250859123714718_6104288111010466881_n.jpg',
    '493272461_1260164816117482_3758469469945750571_n.jpg',
    '493468150_1260164906117473_8939871710073352573_n.jpg',
    '493737095_1260164909450806_6666939914771122798_n.jpg',
    '494005379_1260164856117478_6368702701761718367_n.jpg',
    '494090496_1260164956117468_2785811314254096813_n.jpg',
    '494096869_1262457895888174_7346350511475005594_n.jpg',
    '494584536_1262457962554834_7258760863938959064_n.jpg',
    '494669375_1262457699221527_9135505405175271809_n.jpg',
    '494764138_1262457705888193_7459558796317442054_n.jpg',
    '499813782_1284139160386714_6859996329049751199_n.jpg',
    '515299272_1320713926729237_2503452342838229368_n.jpg',
    // Other gallery images
    '00aad105-eacb-4ffd-a787-042fb0927e77.jpeg',
    '11c8c64e-29cd-428e-b8f1-251076ec3cb6.jpeg',
    '8c907007-cf72-4d96-b91e-05026f758602.jpeg',
    'c380bb4d-80b5-48ca-ba29-752e3bd67c17.jpeg',
    'maandhise.jpg',
  ];

  // Auto-swipe functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [galleryImages.length]);


  // Load companies for carousel
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await companyService.getPublicCompanies({ limit: 20 });
        const loadedCompanies = response.companies || [];
        setCompanies(loadedCompanies);
      } catch (error) {
        console.error('Failed to load companies:', error);
        setCompanies([]);
      }
    };
    loadCompanies();
  }, []);

  // Get card colors based on business type
  const getCardColors = (businessType: string) => {
    const colorMap: { [key: string]: { from: string; to: string } } = {
      supermarket: { from: 'from-green-500', to: 'to-green-600' },
      pharmacy: { from: 'from-blue-500', to: 'to-blue-600' },
      restaurant: { from: 'from-red-500', to: 'to-red-600' },
      clothing: { from: 'from-purple-500', to: 'to-purple-600' },
      electronics: { from: 'from-indigo-500', to: 'to-indigo-600' },
      beauty: { from: 'from-pink-500', to: 'to-pink-600' },
      healthcare: { from: 'from-teal-500', to: 'to-teal-600' },
      automotive: { from: 'from-orange-500', to: 'to-orange-600' },
      education: { from: 'from-cyan-500', to: 'to-cyan-600' },
      services: { from: 'from-amber-500', to: 'to-amber-600' },
      furniture: { from: 'from-yellow-600', to: 'to-yellow-700' },
      telecommunication: { from: 'from-violet-500', to: 'to-violet-600' },
      travelagency: { from: 'from-emerald-500', to: 'to-emerald-600' },
      other: { from: 'from-gray-500', to: 'to-gray-600' }
    };
    return colorMap[businessType] || { from: 'from-blue-500', to: 'to-blue-600' };
  };

  const stats = [
    { number: '10,000+', label: language === 'en' ? 'Our Clients' : 'Macamiisha' },
    { number: '100%', label: language === 'en' ? 'Customer Satisfaction' : 'Raalli Galin' },
  ];

  return (
    <>
      <Helmet>
        <title>SAHAL CARD - Save More, Spend Less | Somalia's Leading Discount Card</title>
        <meta name="description" content="Join 10,000+ Somalis saving with Sahal Card. Get exclusive discounts at 500+ partner businesses across Somalia. Education, consulting & savings solutions." />
        <meta name="keywords" content="maandhise, sahacard, discount card, somalia, mogadishu, savings, education, consulting, business" />
        <meta name="author" content="SAHAL CARD" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://maandhise.com/" />
        <meta property="og:title" content="SAHAL CARD - Save More, Spend Less" />
        <meta property="og:description" content="Join 10,000+ Somalis saving with Sahal Card. Get exclusive discounts at 500+ partner businesses across Somalia." />
        <meta property="og:image" content="https://maandhise.com/og-home.png" />
        <meta property="og:site_name" content="SAHAL CARD" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://maandhise.com/" />
        <meta property="twitter:title" content="SAHAL CARD - Save More, Spend Less" />
        <meta property="twitter:description" content="Join 10,000+ Somalis saving with Sahal Card. Get exclusive discounts at 500+ partner businesses across Somalia." />
        <meta property="twitter:image" content="https://maandhise.com/og-home.png" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://maandhise.com/" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SAHAL CARD",
            "description": "Uniting Education, Consulting & Savings for a better future in Somalia",
            "url": "https://maandhise.com",
            "logo": "https://maandhise.com/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+252-613-273-911",
              "contactType": "customer service",
              "availableLanguage": ["English", "Somali"]
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Mogadishu",
              "addressCountry": "Somalia"
            },
            "sameAs": [
              "https://wa.me/252613273911"
            ],
            "foundingDate": "2021",
            "founder": {
              "@type": "Person",
              "name": "Abdullahi Abdi Elmi"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 relative">
        {/* Hero Section */}
        <div className="min-h-[100dvh] flex flex-col items-center justify-center py-12 px-4">
          <div className="relative w-full max-w-6xl flex items-center justify-center">
            {/* Background Elements - Optimized for performance */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-blue-100/30 to-indigo-100/20 pointer-events-none overflow-hidden">
              <div className="absolute top-10 left-[-10%] w-[60%] h-[60%] bg-blue-200/40 rounded-full mix-blend-multiply blur-3xl"></div>
              <div className="absolute top-20 right-[-10%] w-[60%] h-[60%] bg-cyan-200/40 rounded-full mix-blend-multiply blur-3xl"></div>
              <div className="absolute -bottom-20 left-[20%] w-[60%] h-[60%] bg-indigo-200/40 rounded-full mix-blend-multiply blur-3xl"></div>
            </div>


            <div className="relative z-10 w-full text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6 sm:space-y-8"
              >
                {/* Main Heading */}
                <div className="space-y-3 sm:space-y-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight"
                  >
                    <span className="gradient-text">
                      {language === 'en' ? 'SAHAL CARD' : 'SAHAL CARD'}
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
                  >
                    {language === 'en'
                      ? 'Save more, Spend less'
                      : 'Waxbarasho, La Taliye & Keydin wada jirka ah si loo helo mustaqbal wanaagsan Soomaaliya'
                    }
                  </motion.p>
                </div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <button
                    onClick={() => navigate('/get-sahal-card')}
                    className="btn-primary w-full sm:w-auto text-base px-8 py-4 flex items-center justify-center space-x-2 group shadow-xl hover:shadow-2xl transition-all"
                  >
                    <span>{language === 'en' ? 'Get Sahal Card' : 'Hel Kaarka Sahal'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>

                  <a
                    href="#sahal-card"
                    className="btn-secondary w-full sm:w-auto text-base px-8 py-4 flex items-center justify-center space-x-2 group"
                  >
                    <span>{language === 'en' ? 'Learn More' : 'Wax Dheeraad ah'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </a>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto"
                >
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/50">
                      <div className="text-xl md:text-3xl font-bold gradient-text mb-1">
                        {stat.number}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600 font-semibold uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Company Discount Cards Carousel */}
                {companies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                    className="mt-12 sm:mt-16 relative w-full overflow-hidden"
                  >
                    <div className="flex w-full py-8">
                      <div
                        className="flex gap-4 sm:gap-10 carousel-scroll"
                        style={{
                          animation: 'scroll-left 50s linear infinite',
                          width: 'max-content',
                          willChange: 'transform',
                          WebkitFontSmoothing: 'antialiased',
                          backfaceVisibility: 'hidden',
                          transform: 'translate3d(0, 0, 0)'
                        }}
                      >
                        {/* Duplicate the array multiple times to create seamless infinite scroll */}
                        {[...companies, ...companies, ...companies, ...companies].map((company, index) => (
                          <div
                            key={`${company._id}-${index}`}
                            className="flex-shrink-0 w-40 sm:w-64 relative group px-2"
                            style={{ backfaceVisibility: 'hidden', transform: 'translate3d(0,0,0)' }}
                          >
                            <div className={`relative h-full rounded-[1.5rem] sm:rounded-[2.5rem] bg-gradient-to-br ${getCardColors(company.businessType).from} ${getCardColors(company.businessType).to} p-5 sm:p-8 border border-white/20 shadow-xl transition-all duration-500 overflow-hidden group-hover:-translate-y-2`}>
                              <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 sm:w-36 sm:h-36 flex items-center justify-center mb-4 sm:mb-6 bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-inner transition-transform duration-500 group-hover:scale-105">
                                  {company.logo && company.logo.trim() !== '' ? (
                                    <img
                                      src={company.logo}
                                      alt={`${company.businessName} logo`}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <Building2 className="w-12 h-12 sm:w-20 sm:h-20 text-indigo-500/50" />
                                  )}
                                </div>
                                <h3 className="text-sm sm:text-xl font-black text-white text-center leading-tight truncate w-full mb-1 sm:mb-2 tracking-tight">
                                  {company.businessName}
                                </h3>
                                <p className="text-white/80 text-[10px] sm:text-sm text-center font-bold uppercase tracking-widest truncate w-full opacity-90">
                                  {company.businessType}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Gallery Section Below Hero - Temporarily Hidden
        <div className="py-16 bg-white/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-3">
                {language === 'en' ? 'Our Gallery' : 'Gallery-ga'}
              </h2>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                {language === 'en'
                  ? 'Explore our collection of moments and achievements'
                  : 'Baaritaan ururka wakhtiyada iyo guulaha'
                }
              </p>
            </motion.div>

            <div className="relative max-w-4xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-xl">
                <div className="relative h-80 md:h-96">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <img
                        src={`/icons/${galleryImages[currentImageIndex]}`}
                        alt={`SAHAL CARD gallery ${currentImageIndex + 1} - showcasing our achievements and community events`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/icons/maandhise.jpg`;
                          target.onerror = null;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute bottom-4 right-4 flex space-x-1.5">
                    {galleryImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex
                            ? 'bg-white scale-125'
                            : 'bg-white/50 hover:bg-white/70'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        */}


      </div>
    </>
  );
};

export default HomePage;