import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { CreditCard, Shield, MapPin, Star, Users, Zap } from 'lucide-react';

const SahalCardPage: React.FC = () => {
  const { language } = useTheme();


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-xl">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
            {language === 'en' ? 'Sahal Card' : 'Kaarka Sahal'}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {language === 'en' 
              ? 'Your gateway to exclusive discounts and savings across Somalia.'
              : 'Albaabkaaga qiimo dhimis gaar ah iyo keydin Soomaaliya oo dhan.'
            }
          </p>
        </motion.div>

        {/* What is Sahal Card Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm border border-white/50 shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500 rounded-full translate-y-24 -translate-x-24"></div>
            </div>
            
            <div className="relative p-6 md:p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {language === 'en' ? 'What is Sahal Card?' : 'Waa Maxay Kaarka Sahal?'}
          </h2>
              </div>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-4xl">
            {language === 'en' 
              ? 'Sahal Card is our innovative savings card that provides exclusive discounts at partner businesses across Somalia. With just one card, you can save money on groceries, restaurants, healthcare, education, and more.'
              : 'Kaarka Sahal waa kaarkayaga keydin cusub oo bixinaya qiimo dhimis gaar ah ganacsiga la shaqeeya Soomaaliya oo dhan. Kaarka hal ah oo keliya, waxaad keydin kartaa lacag cunto, maqaayadaha, caafimaadka, waxbarashada, iyo wax dheeraad ah.'
            }
          </p>
            </div>
          </div>
        </motion.div>

        {/* Why Choose Sahal Card Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="mb-20 relative z-20"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              {language === 'en' ? 'Why Choose Sahal Card?' : 'Maxaad Dooran Kartaa Kaarka Sahal?'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Join thousands of Somalis who are already saving with Sahal Card'
                : 'Ku biir kunno Soomaali ah oo horey u keydinayeen Kaarka Sahal'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Benefit 1: Exclusive Discounts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-yellow-50/80 backdrop-blur-sm border border-white/50 hover:border-white/70 transition-all duration-500 hover:shadow-2xl z-10"
            >
              <div className="relative p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {language === 'en' ? 'Exclusive Discounts' : 'Qiimo Dhimis Gaar ah'}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {language === 'en' 
                    ? 'Special offers at partner businesses'
                    : 'Deymo gaar ah ganacsiga la shaqeeya'
                  }
                </p>
              </div>
            </motion.div>

            {/* Benefit 2: Saving More, Spending Less */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-green-50/80 backdrop-blur-sm border border-white/50 hover:border-white/70 transition-all duration-500 hover:shadow-2xl z-10"
            >
              <div className="relative p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {language === 'en' ? 'Saving More, Spending Less' : 'Keydin Badan, Qaad Yar'}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {language === 'en' 
                    ? 'Maximize your savings with every purchase'
                    : 'Kordhi keydintaada dhammaan iibsashada'
                  }
                </p>
              </div>
            </motion.div>

            {/* Benefit 3: Trusted and Reliable Network */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm border border-white/50 hover:border-white/70 transition-all duration-500 hover:shadow-2xl z-10"
            >
              <div className="relative p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {language === 'en' ? 'Trusted and Reliable Network' : 'Shabakad Aamin iyo Aammin'}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {language === 'en' 
                    ? 'Secure transactions with trusted partners'
                    : 'Dhaqdhaqaaqyo aamin la shaqeeya la shaqeeya'
                  }
                </p>
              </div>
            </motion.div>

            {/* Benefit 4: Empowering Local Business */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-purple-50/80 backdrop-blur-sm border border-white/50 hover:border-white/70 transition-all duration-500 hover:shadow-2xl z-10"
            >
              <div className="relative p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {language === 'en' ? 'Empowering Local Business' : 'Awoodsiinta Ganacsiga Dhexe'}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {language === 'en' 
                    ? 'Supporting and growing local businesses'
                    : 'Taageerada iyo koritaanka ganacsiga dhexe'
                  }
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>


      </div>
    </div>
  );
};

export default SahalCardPage;