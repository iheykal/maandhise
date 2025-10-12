import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext.tsx';

const ServicesPage: React.FC = () => {
  const { language } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            {language === 'en' ? 'Our Services' : 'Adeegahayaga'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'en' 
              ? 'Comprehensive solutions for education, business consulting, and savings.'
              : 'Xalalka buuxa ee waxbarasho, la taliye ganacsi, iyo keydin.'
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sahal Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50 hover:border-blue-300/70 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500 rounded-full translate-y-12 -translate-x-12"></div>
            </div>
            
            <div className="relative p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                {language === 'en' ? 'Sahal Card' : 'Kaarka Sahal'}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {language === 'en' 
                  ? 'Get exclusive discounts at partner businesses across Somalia with our innovative savings card.'
                  : 'Hel qiimo dhimis gaar ah ganacsiga la shaqeeya Soomaaliya oo dhan iyadoo la adeegsanayo kaarkayaga keydin cusub.'
                }
              </p>
            </div>
          </motion.div>

          {/* Education */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 hover:border-emerald-300/70 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500 rounded-full translate-y-12 -translate-x-12"></div>
            </div>
            
            <div className="relative p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
                {language === 'en' ? 'Education' : 'Waxbarasho'}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {language === 'en' 
                  ? 'Access quality education and training programs designed for the Somali community.'
                  : 'Hel waxbarasho tayo leh iyo barnaamijyada tababarka loo qorsheeyay bulshada Soomaaliyeed.'
                }
              </p>
            </div>
          </motion.div>

          {/* Consulting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/50 hover:border-purple-300/70 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500 rounded-full translate-y-12 -translate-x-12"></div>
            </div>
            
            <div className="relative p-8">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                {language === 'en' ? 'Consulting' : 'La Taliye'}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {language === 'en' 
                  ? 'Professional business and career consulting services to help you succeed.'
                  : 'Adeegyo la taliye ganacsi iyo shaqo si looga caawiyo inaad guul ka gaarto.'
                }
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;