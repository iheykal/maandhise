import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { 
  CreditCard, 
  GraduationCap, 
  Briefcase
} from 'lucide-react';

const ServicesPage: React.FC = () => {
  const { language } = useTheme();

  return (
    <>
      <Helmet>
        <title>Our Services - Sahal Card, Education & Business Consulting | Maandhise</title>
        <meta name="description" content="Discover Maandhise's comprehensive services: Sahal discount card, quality education programs, and professional business consulting across Somalia." />
        <meta name="keywords" content="maandhise services, sahacard, education somalia, business consulting, discount card, somalia business services" />
        <meta name="author" content="SAHAL CARD" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://maandhise.com/services" />
        <meta property="og:title" content="Our Services - Sahal Card, Education & Business Consulting" />
        <meta property="og:description" content="Discover Maandhise's comprehensive services: Sahal discount card, quality education programs, and professional business consulting across Somalia." />
        <meta property="og:image" content="https://maandhise.com/og-services.png" />
        <meta property="og:site_name" content="SAHAL CARD" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://maandhise.com/services" />
        <meta property="twitter:title" content="Our Services - Sahal Card, Education & Business Consulting" />
        <meta property="twitter:description" content="Discover Maandhise's comprehensive services: Sahal discount card, quality education programs, and professional business consulting across Somalia." />
        <meta property="twitter:image" content="https://maandhise.com/og-services.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://maandhise.com/services" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'en' ? 'Our Services' : 'Adeegahayaga'}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {language === 'en' 
                ? 'Comprehensive solutions for education, business consulting, and savings designed to empower the Somali community.'
                : 'Xalalka buuxa ee waxbarasho, la taliye ganacsi, iyo keydin loo qorsheeyay si loo awoodsiiso bulshada Soomaaliyeed.'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: CreditCard,
                title: language === 'en' ? 'Sahal Card' : 'Kaarka Sahal',
                description: language === 'en' 
                  ? 'Get exclusive discounts at partner businesses across Somalia with our innovative savings card.'
                  : 'Hel qiimo dhimis gaar ah ganacsiga la shaqeeya Soomaaliya oo dhan iyadoo la adeegsanayo kaarkayaga keydin cusub.'
              },
              {
                icon: GraduationCap,
                title: language === 'en' ? 'Education' : 'Waxbarasho',
                description: language === 'en' 
                  ? 'Access quality education and training programs designed for the Somali community.'
                  : 'Hel waxbarasho tayo leh iyo barnaamijyada tababarka loo qorsheeyay bulshada Soomaaliyeed.'
              },
              {
                icon: Briefcase,
                title: language === 'en' ? 'Consulting' : 'La Taliye',
                description: language === 'en' 
                  ? 'Professional business and career consulting services to help you succeed.'
                  : 'Adeegyo la taliye ganacsi iyo shaqo si looga caawiyo inaad guul ka gaarto.'
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 hover-lift"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="glass-card p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold gradient-text mb-4">
                {language === 'en' 
                  ? 'SAHAL CARD — Education, Consulting, and Savings for All.'
                  : 'SAHAL CARD — Waxbarasho, La Taliye, iyo Keydin Dhammaan Dadka.'
                }
              </h3>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;