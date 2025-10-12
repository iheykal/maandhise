import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useNavigate } from 'react-router-dom';
import VirtualSahalCard from '../components/VirtualSahalCard.tsx';

const GetSahalCardPage: React.FC = () => {
  const { language } = useTheme();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = React.useState(false);



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          {language === 'en' ? 'Back' : 'Dib u Noqo'}
        </motion.button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-8 shadow-2xl">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            {language === 'en' ? 'Get Your Sahal Card' : 'Hel Kaarkaaga Sahal'}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {language === 'en' 
              ? 'Join thousands of Somalis who are already saving money with Sahal Card. Start your savings journey today!'
              : 'Ku biir kunno Soomaali ah oo horey u keydinayeen lacag Kaarka Sahal. Bilaab socodkaaga keydin maanta!'
            }
          </p>
        </motion.div>

        {/* WhatsApp Order Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-green-600 p-12 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {language === 'en' ? 'Ready to Get Your Sahal Card?' : 'Diyaar u Tahay inaad Heldo Kaarkaaga Sahal?'}
              </h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                {language === 'en' 
                  ? 'Order your Sahal Card now via WhatsApp and start saving money today!'
                  : 'Dalbo Kaarkaaga Sahal hadda WhatsApp ku adoo bilaabaya keydin lacag maanta!'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const message = language === 'en' 
                      ? 'Hello! I would like to order a Sahal Card. Please provide me with more information about the membership and how to get started.'
                      : 'Salaan! Waxaan rabaa inaan dalbo Kaarka Sahal. Fadlan ii soo dir macluumaad dheeraad ah ku saabsan xubnimo iyo sida loo bilaabayo.';
                    
                    // Show success message first
                    setShowSuccess(true);
                    
                    // Open WhatsApp after a short delay so user can see the success message
                    setTimeout(() => {
                      window.open(`https://wa.me/252613273911?text=${encodeURIComponent(message)}`, '_blank');
                    }, 1100);
                    
                    // Hide success message after 4 seconds
                    setTimeout(() => {
                      setShowSuccess(false);
                    }, 4000);
                  }}
                  className="px-8 py-4 bg-white text-green-600 rounded-2xl font-semibold hover:bg-green-50 transition-all duration-300 shadow-lg inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  {language === 'en' ? 'Order via WhatsApp' : 'Dalbo WhatsApp ku'}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-8 py-4 border-2 border-white text-white rounded-2xl font-semibold hover:bg-white hover:text-green-600 transition-all duration-300"
                >
                  {language === 'en' ? 'Back to Home' : 'Dib u Noqo Guri'}
                </button>
              </div>
              
              <div className="mt-6 text-green-200 text-sm">
                {language === 'en' 
                  ? '📱 Click the button above to start your order process'
                  : '📱 Guji badhanka kor ku xusan si aad u bilaabto habka dalabka'
                }
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl border border-green-400 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {language === 'en' ? 'Transferring to Support!' : 'Waa la gudbiyaa Taageerada!'}
                  </h3>
                  <p className="text-green-100 text-sm">
                    {language === 'en' 
                      ? 'You have been transferred to Sahal Card customer support'
                      : 'Waxaad loo gudbiyay taageerada macaamiisha Kaarka Sahal'
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Virtual Card Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4">
              {language === 'en' ? 'Your Virtual Sahal Card' : 'Kaarkaaga Sahal Virtual'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'This is how your digital Sahal Card will look'
                : 'Sidan ayay u eegi doontaa Kaarkaaga Sahal digital'
              }
            </p>
          </div>
          
          <div className="flex justify-center">
            <VirtualSahalCard 
              cardNumber="ID.001"
              expiryDate="2026/12/31"
              className="transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </motion.div>



        {/* Sample Discount Offers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              {language === 'en' ? 'Discount Offers' : 'Qiimo Dhimis'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'See the amazing discounts you can get with your Sahal Card'
                : 'Arag faa\'iidooyinka cajiibka ah ee aad ka heli kartid Kaarkaaga Sahal'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Hayat Supermarket Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <img 
                      src="/icons/heyat.png" 
                      alt="Hayat Market" 
                      className="w-full h-full object-contain bg-transparent"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">20%</div>
                    <div className="text-sm opacity-90">OFF</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Hayat Supermarket</h3>
                <p className="text-green-100 text-sm mb-4">
                  {language === 'en' 
                    ? 'Get 20% discount on all groceries and household items'
                    : 'Hel 20% qiimo dhimis dhammaan cunto iyo alaabta guriga'
                  }
                </p>
                <div className="flex items-center justify-between text-xs opacity-80">
                  <span>📍 Mogadishu</span>
                  <span>🕒 All Day</span>
                </div>
              </div>
            </motion.div>

            {/* Somali Sudanese Restaurant Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img 
                      src="/icons/somali-sudanese-specialized-hospital.png" 
                      alt="Somali Sudanese" 
                      className="w-full h-full object-contain bg-transparent"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">40%</div>
                    <div className="text-sm opacity-90">OFF</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Somali Sudanese</h3>
                <p className="text-orange-100 text-sm mb-4">
                  {language === 'en' 
                    ? 'Enjoy 40% discount on traditional Somali and Sudanese dishes'
                    : 'Ku raaxayso 40% qiimo dhimis cuntooyinka dhaqameedka Soomaali iyo Suudaan'
                  }
                </p>
                <div className="flex items-center justify-between text-xs opacity-80">
                  <span>📍 Mogadishu</span>
                  <span>🕒 All Day</span>
                </div>
              </div>
            </motion.div>

            {/* More Sample Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <img 
                      src="/icons/juba.png" 
                      alt="Jubba Hypermarket" 
                      className="w-full h-full object-contain bg-transparent"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">15%</div>
                    <div className="text-sm opacity-90">OFF</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Jubba Hypermarket</h3>
                <p className="text-blue-100 text-sm mb-4">
                  {language === 'en' 
                    ? 'Save 15% on groceries and household essentials'
                    : 'Keydi 15% cunto iyo alaabta guriga muhiimka ah'
                  }
                </p>
                <div className="flex items-center justify-between text-xs opacity-80">
                  <span>📍 Mogadishu</span>
                  <span>🕒 All Day</span>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default GetSahalCardPage;
