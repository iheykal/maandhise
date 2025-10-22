import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, CreditCard, Search, XCircle, Phone, Calendar, User, Trash2, X, DollarSign } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useNavigate } from 'react-router-dom';

const GetSahalCardPage: React.FC = () => {
  const { language } = useTheme();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Search functionality state
  const [searchId, setSearchId] = React.useState('');
  const [searchedUser, setSearchedUser] = React.useState<any>(null);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [selectedUserImage, setSelectedUserImage] = React.useState<{user: any, imageUrl: string} | null>(null);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.100.32:5000/api';

  // Helper function to extract only numbers from a string
  const extractNumbers = (str: string): string => {
    return str.replace(/\D/g, '');
  };

  // Helper function to generate card number from user ID
  const generateCardNumber = (user: any): string => {
    if (user.idNumber) {
      const numbers = extractNumbers(user.idNumber);
      return numbers.slice(-8); // Take last 8 digits
    }
    // Fallback to user ID if no ID number
    const numbers = extractNumbers(user._id);
    return numbers.slice(-8);
  };

  // Calculate months owed for expired users
  const calculateMonthsOwed = (validUntil: string) => {
    const now = new Date();
    const expiredDate = new Date(validUntil);
    
    if (expiredDate >= now) return 0;
    
    const yearsDiff = now.getFullYear() - expiredDate.getFullYear();
    const monthsDiff = now.getMonth() - expiredDate.getMonth();
    const totalMonthsExpired = (yearsDiff * 12) + monthsDiff;
    
    return Math.max(0, totalMonthsExpired);
  };

  // Calculate remaining months and balance (1 month = $1)
  const calculateRemainingBalance = (validUntil: string | undefined, createdAt: string | undefined) => {
    if (!validUntil || !createdAt) return { months: 0, balance: 0, isValid: false };
    
    const now = new Date();
    const expiryDate = new Date(validUntil);
    // const registrationDate = new Date(createdAt);
    
    // If expired, balance is negative (debt)
    if (expiryDate < now) {
      const monthsExpired = calculateMonthsOwed(validUntil);
      return { 
        months: -monthsExpired, 
        balance: -monthsExpired, 
        isValid: false 
      };
    }
    
    // Calculate remaining months from now until expiry
    const yearsDiff = expiryDate.getFullYear() - now.getFullYear();
    const monthsDiff = expiryDate.getMonth() - now.getMonth();
    const daysDiff = expiryDate.getDate() - now.getDate();
    
    let remainingMonths = (yearsDiff * 12) + monthsDiff;
    
    // If days are negative, subtract one month
    if (daysDiff < 0) {
      remainingMonths--;
    }
    
    // Ensure at least 0 months
    remainingMonths = Math.max(0, remainingMonths);
    
    return { 
      months: remainingMonths, 
      balance: remainingMonths, // $1 per month
      isValid: true 
    };
  };

  // Search user by ID
  const searchUserById = async (idNumber: string) => {
    if (!idNumber.trim()) {
      setSearchError('Please enter an ID number');
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchedUser(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/search-by-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idNumber: idNumber.trim() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSearchedUser(data.user);
        setSearchError(null);
      } else {
        setSearchError(data.message || 'User not found');
        setSearchedUser(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search user');
      setSearchedUser(null);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Get Your Sahal Card - Order Now | Maandhise Corporate</title>
        <meta name="description" content="Order your Sahal Card via WhatsApp and start saving today! Join thousands of Somalis already saving money with exclusive discounts." />
        <meta name="keywords" content="order sahacard, get sahacard, sahacard somalia, order discount card, whatsapp order, maandhise card order" />
        <meta name="author" content="Maandhise Corporate" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://maandhise.com/get-sahal-card" />
        <meta property="og:title" content="Get Your Sahal Card - Order Now" />
        <meta property="og:description" content="Order your Sahal Card via WhatsApp and start saving today! Join thousands of Somalis already saving money with exclusive discounts." />
        <meta property="og:image" content="https://maandhise.com/og-get-sahal-card.png" />
        <meta property="og:site_name" content="Maandhise Corporate" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://maandhise.com/get-sahal-card" />
        <meta property="twitter:title" content="Get Your Sahal Card - Order Now" />
        <meta property="twitter:description" content="Order your Sahal Card via WhatsApp and start saving today! Join thousands of Somalis already saving money with exclusive discounts." />
        <meta property="twitter:image" content="https://maandhise.com/og-get-sahal-card.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://maandhise.com/get-sahal-card" />
      </Helmet>
      
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

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-16"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-visible">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 px-6 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {language === 'en' ? 'Search for Your Card' : 'Raadi Kaarkaaga'}
                  </h2>
                  <p className="text-gray-600">
                    {language === 'en' ? 'Search user by ID to get their Sahal Card information' : 'Raadi isticmaale si aad u hesho macluumaadka Sahal Card-ka'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 pb-12">
              {/* Search Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'en' ? 'Search by ID Number' : 'Raadi Lambarka Aqoonsiga'}
                </label>
                <div className="flex space-x-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={searchId}
                      onChange={(e) => {
                        // Only allow numeric digits
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        setSearchId(numericValue);
                      }}
                      placeholder={language === 'en' ? 'Enter ID number...' : 'Geli lambarka aqoonsiga...'}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => searchUserById(searchId)}
                    disabled={searchLoading || !searchId.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {searchLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{language === 'en' ? 'Searching...' : 'Waa la raadinayaa...'}</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>{language === 'en' ? 'Search' : 'Raadi'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {searchError && (
                <motion.div 
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{searchError}</span>
                  </div>
                </motion.div>
              )}

              {/* User Card Display - Exact format from Users tab */}
              {searchedUser && (
                <motion.div 
                  className="mt-8 mb-8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-center px-4">
                    <motion.div 
                      className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm"
                      whileHover={{ y: -5, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                      transition={{ duration: 0.3 }}
                    >
                    {/* Card Header with gradient */}
                    <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                      {/* INVALID badge for expired users */}
                      {searchedUser.validUntil && new Date() > new Date(searchedUser.validUntil) && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                          <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                            INVALID
                          </div>
                        </div>
                      )}
                      
                      {/* VALID badge for valid users */}
                      {searchedUser.validUntil && new Date() <= new Date(searchedUser.validUntil) && (
                        <div className="absolute top-4 right-4 z-30">
                          <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                            VALID
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Avatar with enhanced styling */}
                    <div className="relative -mt-16 px-6 pb-6">
                      <div className="w-full flex items-center justify-center">
                        {searchedUser.profilePicUrl || searchedUser.profilePic ? (
                          <div className="relative cursor-pointer group/avatar" onClick={() => {
                            setSelectedUserImage({ 
                              user: searchedUser, 
                              imageUrl: searchedUser.profilePicUrl || searchedUser.profilePic 
                            });
                          }}>
                            <img
                              src={searchedUser.profilePicUrl || searchedUser.profilePic}
                              alt={searchedUser.fullName}
                              className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-2xl transition-all duration-300 group-hover/avatar:scale-110 group-hover/avatar:shadow-3xl"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                              searchedUser.validUntil && new Date() > new Date(searchedUser.validUntil)
                                ? 'bg-red-500' // Red status for expired
                                : 'bg-green-500' // Green status for valid
                            }`}>
                              <div className="w-3 h-3 bg-white rounded-full" />
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-4 ring-white shadow-2xl flex items-center justify-center">
                              <User className="w-12 h-12 text-white" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                              searchedUser.validUntil && new Date() > new Date(searchedUser.validUntil)
                                ? 'bg-red-500' // Red status for expired
                                : 'bg-green-500' // Green status for valid
                            }`}>
                              <div className="w-3 h-3 bg-white rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* User Information - Clean Structure */}
                      <div className="mt-4 space-y-3">
                        {/* Name */}
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 truncate">
                              {searchedUser.fullName}
                            </h3>
                            {searchedUser.validUntil && new Date() <= new Date(searchedUser.validUntil) && (
                              <img 
                                src="/icons/check.png" 
                                alt="Valid" 
                                className="w-5 h-5"
                              />
                            )}
                          </div>
                        </div>

                        {/* Information Grid */}
                        <div className="space-y-2 text-sm">
                          {/* Phone Number */}
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-gray-600 font-medium flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {language === 'en' ? 'Number' : 'Lambar'}
                            </span>
                            <span className="text-gray-900 font-semibold">{searchedUser.phone}</span>
                          </div>

                          {/* ID Number */}
                          {searchedUser.idNumber && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-gray-600 font-medium flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                {language === 'en' ? 'ID' : 'Aqoonsi'}
                              </span>
                              <span className="text-gray-900 font-semibold">{searchedUser.idNumber}</span>
                            </div>
                          )}

                          {/* Registration Date */}
                          {searchedUser.createdAt && (
                            <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                              <span className="text-blue-600 font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {language === 'en' ? 'Registered' : 'Diiwaangashan'}
                              </span>
                              <span className="text-blue-900 font-semibold">{new Date(searchedUser.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}

                          {/* Generated Card Number */}
                          <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                            <span className="text-green-600 font-medium flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              {language === 'en' ? 'Card Number' : 'Lambarka Kaadhka'}
                            </span>
                            <span className="text-green-900 font-semibold font-mono">{generateCardNumber(searchedUser)}</span>
                          </div>

                          {/* Balance Information */}
                          {(() => {
                            const balanceInfo = calculateRemainingBalance(searchedUser.validUntil, searchedUser.createdAt);
                            return (
                              <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                                balanceInfo.balance < 0 
                                  ? 'bg-red-50' 
                                  : balanceInfo.balance > 0 
                                    ? 'bg-blue-50' 
                                    : 'bg-gray-50'
                              }`}>
                                <span className={`font-medium flex items-center gap-2 ${
                                  balanceInfo.balance < 0 
                                    ? 'text-red-600' 
                                    : balanceInfo.balance > 0 
                                      ? 'text-blue-600' 
                                      : 'text-gray-600'
                                }`}>
                                  <DollarSign className="w-4 h-4" />
                                  {language === 'en' ? 'Balance' : 'Xisaabta'}
                                </span>
                                <div className="text-right">
                                  <div className={`font-semibold ${
                                    balanceInfo.balance < 0 
                                      ? 'text-red-900' 
                                      : balanceInfo.balance > 0 
                                        ? 'text-blue-900' 
                                        : 'text-gray-900'
                                  }`}>
                                    ${Math.abs(balanceInfo.balance)}
                                  </div>
                                  <div className={`text-xs ${
                                    balanceInfo.balance < 0 
                                      ? 'text-red-600' 
                                      : balanceInfo.balance > 0 
                                        ? 'text-blue-600' 
                                        : 'text-gray-600'
                                  }`}>
                                    {balanceInfo.isValid ? (
                                      <>
                                        {balanceInfo.months} {language === 'en' ? 'month' : 'bil'}{balanceInfo.months !== 1 ? 's' : ''} {language === 'en' ? 'remaining' : 'oo haray'}
                                      </>
                                    ) : balanceInfo.balance < 0 ? (
                                      <>
                                        {language === 'en' ? 'Owes' : 'Wuu Leeyahay'}: {Math.abs(balanceInfo.months)} {language === 'en' ? 'month' : 'bil'}{Math.abs(balanceInfo.months) !== 1 ? 's' : ''}
                                      </>
                                    ) : (
                                      language === 'en' ? 'No active subscription' : 'Ma jiro rukunka firfircoon'
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSearchedUser(null);
                            setSearchId('');
                            setSearchError(null);
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs font-medium"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{language === 'en' ? 'Clear' : 'Tirtir'}</span>
                        </button>
                      </div>
                    </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

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
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
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
                      alt="Hayat Supermarket - Partner business accepting Sahal Card with 20% discount" 
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
                      alt="Somali Sudanese Restaurant - Partner business accepting Sahal Card with 40% discount" 
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
                      alt="Jubba Hypermarket - Partner business accepting Sahal Card with 15% discount" 
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

    {/* Profile Picture Modal */}
    {selectedUserImage && (
      <div 
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4" 
        onClick={() => setSelectedUserImage(null)}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedUserImage.user.fullName}</h2>
                  <p className="text-blue-100 text-sm">{language === 'en' ? 'Profile Picture' : 'Sawirka Isticmaalaha'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserImage(null)} className="p-2 hover:bg-white/20 rounded-full">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Image Display */}
          <div className="p-6 bg-gray-50">
            <div className="flex justify-center">
              <img
                src={selectedUserImage.imageUrl}
                alt={selectedUserImage.user.fullName}
                className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default GetSahalCardPage;
