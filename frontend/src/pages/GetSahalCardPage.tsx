import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, CreditCard, Search, XCircle, Phone, Calendar, User, Trash2, X, Building2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../services/companyService.ts';
import { categoryService, Category } from '../services/categoryService.ts';

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
  
  // PIN verification state
  const [pin, setPin] = React.useState('');
  const [pinError, setPinError] = React.useState<string | null>(null);
  const [isPinVerified, setIsPinVerified] = React.useState(false);

  // Companies state - load from database
  const [companies, setCompanies] = useState<any[]>([]);
  const [allCompanies, setAllCompanies] = useState<any[]>([]); // Store all companies for client-side filtering
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [businessSearchQuery, setBusinessSearchQuery] = useState<string>('');
  const [showNewlyAdded, setShowNewlyAdded] = useState<boolean>(false);
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Fuzzy search helper - calculates similarity between two strings
  const calculateSimilarity = useCallback((str1: string, str2: string): number => {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // Exact match
    if (s1 === s2) return 1.0;
    
    // Contains match (high score)
    if (s2.includes(s1) || s1.includes(s2)) return 0.9;
    
    // Calculate simple similarity based on common characters
    let matches = 0;
    const minLength = Math.min(s1.length, s2.length);
    const maxLength = Math.max(s1.length, s2.length);
    
    // Check character matches (allowing for some position flexibility)
    for (let i = 0; i < s1.length; i++) {
      if (s2.includes(s1[i])) {
        matches++;
      }
    }
    
    // Check for substring matches (handles typos like missing/extra characters)
    let substringMatches = 0;
    for (let i = 0; i <= s1.length - 3; i++) {
      const substring = s1.substring(i, i + 3);
      if (s2.includes(substring)) {
        substringMatches++;
      }
    }
    
    // Calculate similarity score
    const charScore = matches / maxLength;
    const substringScore = substringMatches / Math.max(1, s1.length - 2);
    const lengthScore = minLength / maxLength;
    
    return (charScore * 0.4 + substringScore * 0.4 + lengthScore * 0.2);
  }, []);

  // Check if company matches search query (with fuzzy matching)
  const matchesSearch = useCallback((company: any, query: string): boolean => {
    if (!query.trim()) return true;
    
    const searchTerm = query.toLowerCase().trim();
    const businessName = (company.businessName || '').toLowerCase();
    const description = (company.description || '').toLowerCase();
    const address = (company.branches?.[0]?.address || '').toLowerCase();
    
    // Exact or contains match (highest priority)
    if (businessName.includes(searchTerm) || 
        description.includes(searchTerm) || 
        address.includes(searchTerm)) {
      return true;
    }
    
    // Fuzzy matching - check similarity
    const nameSimilarity = calculateSimilarity(searchTerm, businessName);
    const descSimilarity = calculateSimilarity(searchTerm, description);
    const addressSimilarity = calculateSimilarity(searchTerm, address);
    
    // Accept if similarity is above 0.5 (50% match) - allows for typos
    const threshold = 0.5;
    return nameSimilarity >= threshold || descSimilarity >= threshold || addressSimilarity >= threshold;
  }, [calculateSimilarity]);

  // Load companies from database
  useEffect(() => {
    const loadCompanies = async () => {
      setCompaniesLoading(true);
      try {
        console.log('[GetSahalCardPage] Loading companies...', { category: selectedCategory });
        const params: any = { limit: 200 }; // Load more to allow client-side fuzzy filtering
        if (selectedCategory !== 'all') {
          params.businessType = selectedCategory;
        }
        // Don't send search to API - we'll do fuzzy matching client-side
        const response = await companyService.getPublicCompanies(params);
        console.log('[GetSahalCardPage] Response:', response);
        console.log('[GetSahalCardPage] Companies count:', response.companies?.length || 0);
        console.log('[GetSahalCardPage] Companies data:', response.companies);
        const loadedCompanies = response.companies || [];
        setAllCompanies(loadedCompanies);
      } catch (error: any) {
        console.error('[GetSahalCardPage] Failed to load companies:', error);
        console.error('[GetSahalCardPage] Error response:', error.response?.data);
        console.error('[GetSahalCardPage] Error message:', error.message);
        // If loading fails, companies array will remain empty
        setCompanies([]);
        setAllCompanies([]);
      } finally {
        setCompaniesLoading(false);
      }
    };

    loadCompanies();
  }, [selectedCategory]);

  // Apply client-side filtering when search query or newly added filter changes
  useEffect(() => {
    let filtered = [...allCompanies];
    
    // Apply fuzzy search filter
    if (businessSearchQuery.trim()) {
      filtered = filtered.filter((company: any) => matchesSearch(company, businessSearchQuery));
    }
    
    // Apply newly added filter
    if (showNewlyAdded) {
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      filtered = filtered.filter((company: any) => {
        const createdAt = new Date(company.createdAt);
        return createdAt >= fifteenDaysAgo;
      });
    }
    
    setCompanies(filtered);
  }, [showNewlyAdded, allCompanies, businessSearchQuery, matchesSearch]);

  // Load categories on mount - load all categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getCategories(false); // Get all categories (including inactive)
        setCategories(response.categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Get card colors based on business type (from category or default)
  const getCardColors = (businessType: string) => {
    const category = categories.find(cat => cat.name === businessType.toLowerCase());
    if (category) {
      return { from: category.color.from, to: category.color.to };
    }
    // Default fallback - strong gray gradient
    return { from: 'from-gray-700', to: 'to-gray-900' };
  };



  // Auto-detect localhost and local network IPs (for mobile devices on same network)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalhost = typeof window !== 'undefined' && (hostname === 'localhost' || hostname === '127.0.0.1');
  const isLocalNetwork = typeof window !== 'undefined' && (hostname.startsWith('192.168.') || hostname.startsWith('10.0.') || hostname.startsWith('172.16.'));
  const defaultApiUrl = (isLocalhost || isLocalNetwork)
    ? (typeof window !== 'undefined' 
        ? `${window.location.protocol}//${hostname}:5000/api`
        : '/api')
    : (typeof window !== 'undefined' 
        ? `${window.location.protocol}//${hostname}/api`
        : '/api');
  const API_BASE_URL = process.env.REACT_APP_API_URL || defaultApiUrl;
  
  console.log('[GetSahalCardPage] API Config:', {
    hostname: typeof window !== 'undefined' ? hostname : 'server',
    isLocalhost,
    isLocalNetwork,
    apiUrl: API_BASE_URL,
  });

  // Helper function to format phone number (remove +252 prefix)
  const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return '';
    // Remove +252 prefix and return local format (0XXXXXXXXX)
    if (phone.startsWith('+252')) {
      return '0' + phone.slice(4);
    }
    if (phone.startsWith('252')) {
      return '0' + phone.slice(3);
    }
    return phone;
  };

  // Helper function to format ID number (remove any country code if present)
  const formatIdNumber = (idNumber: string | undefined): string => {
    if (!idNumber) return '';
    // If ID number starts with +252 or 252, remove it
    if (idNumber.startsWith('+252') || idNumber.startsWith('252')) {
      return idNumber.replace(/^(\+?252)?/, '');
    }
    return idNumber;
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
    setIsPinVerified(false);
    setPin('');
    setPinError(null);

    try {
      console.log('[Search] Starting search for ID:', idNumber.trim());
      console.log('[Search] API URL:', `${API_BASE_URL}/auth/search-by-id`);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${API_BASE_URL}/auth/search-by-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idNumber: idNumber.trim() }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('[Search] Response status:', response.status);
      console.log('[Search] Response ok:', response.ok);

      const data = await response.json();
      console.log('[Search] Response data:', data);

      if (response.ok && data.success) {
        console.log('[Search] User found:', data.user);
        if (data.user) {
          setSearchedUser(data.user);
          setSearchError(null);
          console.log('[Search] User set in state');
        } else {
          console.error('[Search] No user in response data');
          setSearchError('User data not found in response');
          setSearchedUser(null);
        }
      } else {
        console.error('[Search] Search failed:', data.message);
        setSearchError(data.message || 'User not found');
        setSearchedUser(null);
      }
    } catch (error: any) {
      console.error('[Search] Error occurred:', error);
      console.error('[Search] Error message:', error.message);
      console.error('[Search] Error name:', error.name);
      
      if (error.name === 'AbortError') {
        setSearchError('Request timed out. Please try again.');
      } else if (error.message) {
        setSearchError(error.message);
      } else {
        setSearchError('Failed to search user. Please check your connection.');
      }
      setSearchedUser(null);
    } finally {
      setSearchLoading(false);
      console.log('[Search] Search completed, loading set to false');
    }
  };

  // Handle PIN verification - get last 4 digits from original phone number
  const handlePinVerification = () => {
    if (!searchedUser || !searchedUser.phone) {
      setPinError('User data not available');
      return;
    }

    // Get last 4 digits from original phone number (remove +252 if present, then get last 4)
    const userPhone = searchedUser.phone;
    let phoneDigits = userPhone;
    
    // Remove country code if present
    if (phoneDigits.startsWith('+252')) {
      phoneDigits = phoneDigits.slice(4);
    } else if (phoneDigits.startsWith('252')) {
      phoneDigits = phoneDigits.slice(3);
    }
    
    // Get last 4 digits
    const last4Digits = phoneDigits.slice(-4);

    if (pin.trim() === last4Digits) {
      setIsPinVerified(true);
      setPinError(null);
    } else {
      setPinError(language === 'en' ? 'Incorrect PIN. Please try again.' : 'PIN-ka ma sax ah. Fadlan mar kale isku day.');
      setIsPinVerified(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Get Your Sahal Card - Order Now | SAHAL CARD</title>
        <meta name="description" content="Order your Sahal Card via WhatsApp and start saving today! Join thousands of Somalis already saving money with exclusive discounts." />
        <meta name="keywords" content="order sahacard, get sahacard, sahacard somalia, order discount card, whatsapp order, maandhise card order" />
        <meta name="author" content="SAHAL CARD" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://maandhise.com/get-sahal-card" />
        <meta property="og:title" content="Get Your Sahal Card - Order Now" />
        <meta property="og:description" content="Order your Sahal Card via WhatsApp and start saving today! Join thousands of Somalis already saving money with exclusive discounts." />
        <meta property="og:image" content="https://maandhise.com/og-get-sahal-card.png" />
        <meta property="og:site_name" content="SAHAL CARD" />
        
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 sm:mb-6 md:mb-8 transition-colors duration-300 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          {language === 'en' ? 'Back' : 'Dib u Noqo'}
        </motion.button>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mb-8 sm:mb-12 md:mb-16"
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-visible">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 px-4 sm:px-5 md:px-6 py-4 sm:py-5 md:py-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex-shrink-0">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                    {language === 'en' ? 'Search for Your Card' : 'Raadi Kaarkaaga'}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1">
                    {language === 'en' ? 'Search user by ID to get their Sahal Card information' : 'Raadi isticmaale si aad u hesho macluumaadka Sahal Card-ka'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 md:p-6 pb-8 sm:pb-10 md:pb-12">
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

              {/* PIN Verification Form */}
              {searchedUser && Object.keys(searchedUser).length > 0 && !isPinVerified && (
                <motion.div
                  className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {language === 'en' ? 'Verify Identity' : 'Xaqiijinta'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'en' 
                        ? 'Enter the last 4 digits of the phone number to view full information' 
                        : 'Geli 4 xaraf ee ugu dambeeya lambarka telefoonka si aad u aragto macluumaadka dhamaystiran'}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                          setPin(numericValue);
                          setPinError(null);
                        }}
                        placeholder={language === 'en' ? 'Enter 4 digits' : 'Geli 4 lambar'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && pin.length === 4) {
                            handlePinVerification();
                          }
                        }}
                      />
                    </div>
                    {pinError && (
                      <div className="text-red-600 text-sm text-center">{pinError}</div>
                    )}
                    <button
                      onClick={handlePinVerification}
                      disabled={pin.length !== 4}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {language === 'en' ? 'Verify' : 'Xaqiiji'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* User Card Display - Exact format from Users tab */}
              {searchedUser && Object.keys(searchedUser).length > 0 && (
                <motion.div 
                  className="mt-8 mb-8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-center px-4">
                    <div className="relative">
                      <motion.div 
                        className={`relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm transition-all duration-300 ${
                          !isPinVerified ? 'blur-md' : ''
                        }`}
                        whileHover={isPinVerified ? { y: -5, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" } : {}}
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
                        {searchedUser.profilePicUrl && searchedUser.profilePicUrl.trim() !== '' ? (
                          <div className="relative cursor-pointer group/avatar" onClick={async () => {
                            const imageUrl = searchedUser.profilePicUrl;
                            // Try to refresh the image URL first
                            try {
                              const response = await fetch('/api/upload/refresh-url', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({ fileUrl: imageUrl })
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                setSelectedUserImage({ 
                                  user: searchedUser, 
                                  imageUrl: data.data.url 
                                });
                              } else {
                                // Fallback to original URL if refresh fails
                                setSelectedUserImage({ 
                                  user: searchedUser, 
                                  imageUrl: imageUrl 
                                });
                              }
                            } catch (error) {
                              console.log('Failed to refresh image URL, using original:', error);
                              setSelectedUserImage({ 
                                user: searchedUser, 
                                imageUrl: imageUrl 
                              });
                            }
                          }}>
                            <img
                              src={searchedUser.profilePicUrl}
                              alt={searchedUser.fullName}
                              className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-2xl transition-all duration-300 group-hover/avatar:scale-110 group-hover/avatar:shadow-3xl"
                              onError={(e) => {
                                console.log('Profile picture failed to load:', searchedUser.profilePicUrl);
                                e.currentTarget.src = '/icons/founder.jpeg';
                              }}
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
                          {searchedUser.phone && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-gray-600 font-medium flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {language === 'en' ? 'Number' : 'Lambar'}
                              </span>
                              <span className="text-gray-900 font-semibold">{formatPhoneNumber(searchedUser.phone)}</span>
                            </div>
                          )}

                          {/* ID Number */}
                          {searchedUser.idNumber && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-gray-600 font-medium flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                {language === 'en' ? 'ID' : 'Aqoonsi'}
                              </span>
                              <span className="text-gray-900 font-semibold">{formatIdNumber(searchedUser.idNumber)}</span>
                            </div>
                          )}

                          {/* Registration Date */}
                          {searchedUser.createdAt && (
                            <div className="flex items-start justify-between bg-blue-50 rounded-lg px-3 py-2">
                              <span className="text-blue-600 font-medium flex items-center gap-2 flex-shrink-0 text-xs">
                                <Calendar className="w-3 h-3" />
                                {language === 'en' ? 'Registered' : 'Diiwaangashan'}
                              </span>
                              <span className="text-blue-900 font-bold text-right text-sm leading-tight">{new Date(searchedUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                          )}

                          {/* Expiration Date */}
                          {searchedUser.validUntil && (
                            <div className={`flex items-start justify-between rounded-lg px-3 py-2 ${
                              new Date() > new Date(searchedUser.validUntil) 
                                ? 'bg-red-50' 
                                : 'bg-green-50'
                            }`}>
                              <span className={`font-medium flex items-center gap-2 flex-shrink-0 text-xs ${
                                new Date() > new Date(searchedUser.validUntil)
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }`}>
                                <Calendar className="w-3 h-3" />
                                {language === 'en' ? 'Expires' : 'Dhamaan'}
                              </span>
                              <span className={`font-bold text-right text-sm leading-tight ${
                                new Date() > new Date(searchedUser.validUntil)
                                  ? 'text-red-900'
                                  : 'text-green-900'
                              }`}>
                                {new Date(searchedUser.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>
                          )}

                          {/* Card Number - Hidden from public search */}
                          {/* Balance Information - Hidden from public search */}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSearchedUser(null);
                            setSearchId('');
                            setSearchError(null);
                            setIsPinVerified(false);
                            setPin('');
                            setPinError(null);
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs font-medium"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{language === 'en' ? 'Clear' : 'Tirtir'}</span>
                        </button>
                      </div>
                    </div>
                    </motion.div>
                    
                    {/* Blur Overlay Message - Shows when PIN not verified */}
                    {!isPinVerified && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl backdrop-blur-sm z-10 pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg text-center max-w-xs">
                          <p className="text-sm font-semibold text-gray-800 mb-1">
                            {language === 'en' ? 'Protected Information' : 'Macluumaadka La Ilaaliyey'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {language === 'en' 
                              ? 'Enter PIN to view details' 
                              : 'Geli PIN si aad u arko macluumaadka'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* WhatsApp Order Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                {language === 'en' ? 'Ready to Get Your Sahal Card?' : 'Diyaar u Tahay inaad Heldo Kaarkaaga Sahal?'}
              </h2>
              <p className="text-sm md:text-base text-green-100 mb-4 max-w-xl mx-auto">
                {language === 'en' 
                  ? 'Order your Sahal Card now via WhatsApp and start saving money today!'
                  : 'Dalbo Kaarkaaga Sahal hadda WhatsApp ku adoo bilaabaya keydin lacag maanta!'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
                  className="px-6 py-2.5 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 shadow-md inline-flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  {language === 'en' ? 'Order via WhatsApp' : 'Dalbo WhatsApp ku'}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-2.5 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-green-600 transition-all duration-300 text-sm"
                >
                  {language === 'en' ? 'Back to Home' : 'Dib u Noqo Guri'}
                </button>
              </div>
              
              <div className="mt-3 text-green-200 text-xs">
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
          className="mb-8 sm:mb-12 md:mb-16"
        >
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-3 sm:mb-4 px-2">
              {language === 'en' ? 'Discount Offers' : 'Qiimo Dhimis'}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              {language === 'en' 
                ? 'See the amazing discounts you can get with your Sahal Card'
                : 'Arag faa\'iidooyinka cajiibka ah ee aad ka heli kartid Kaarkaaga Sahal'
              }
            </p>
          </div>

          {/* Search Box and Newly Added Filter */}
          <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4 px-2">
            <div className="max-w-md mx-auto w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  value={businessSearchQuery}
                  onChange={(e) => setBusinessSearchQuery(e.target.value)}
                  placeholder={language === 'en' ? 'Search businesses...' : 'Raadi ganacsiga...'}
                  className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white shadow-sm text-sm sm:text-base"
                />
                {businessSearchQuery && (
                  <button
                    onClick={() => setBusinessSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
            {/* Newly Added Filter Toggle */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowNewlyAdded(!showNewlyAdded)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                  showNewlyAdded
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow border border-gray-300'
                }`}
              >
                {language === 'en' ? '✨ Newly Added (Last 15 Days)' : '✨ Cusub (15 Maalmood ee Ugu Dambeeyay)'}
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-wrap gap-2 sm:gap-2.5 justify-center px-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                  selectedCategory === 'all'
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                }`}
              >
                {language === 'en' ? 'All Categories' : 'Dhammaan Noocyada'}
              </button>
              {categoriesLoading ? (
                <div className="px-3 sm:px-4 py-1.5 sm:py-2 text-gray-500 text-xs sm:text-sm">
                  {language === 'en' ? 'Loading categories...' : 'Soo gelaya noocyada...'}
                </div>
              ) : (
                categories
                  .filter(cat => cat.isActive) // Only show active categories in filter buttons
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((category) => {
                    const colors = getCardColors(category.name);
                    // Map Tailwind color classes to actual color values for active state (stronger colors)
                    const colorMap: { [key: string]: string } = {
                      'from-green-500': 'bg-green-600',
                      'from-green-600': 'bg-green-700',
                      'from-blue-500': 'bg-blue-600',
                      'from-blue-600': 'bg-blue-700',
                      'from-red-500': 'bg-red-600',
                      'from-red-600': 'bg-red-700',
                      'from-purple-500': 'bg-purple-600',
                      'from-purple-600': 'bg-purple-700',
                      'from-indigo-500': 'bg-indigo-600',
                      'from-indigo-600': 'bg-indigo-700',
                      'from-pink-500': 'bg-pink-600',
                      'from-pink-600': 'bg-pink-700',
                      'from-teal-500': 'bg-teal-600',
                      'from-teal-600': 'bg-teal-700',
                      'from-orange-500': 'bg-orange-600',
                      'from-orange-600': 'bg-orange-700',
                      'from-cyan-500': 'bg-cyan-600',
                      'from-cyan-600': 'bg-cyan-700',
                      'from-amber-500': 'bg-amber-600',
                      'from-violet-500': 'bg-violet-600',
                      'from-emerald-500': 'bg-emerald-600',
                      'from-gray-500': 'bg-gray-600',
                      'from-gray-700': 'bg-gray-800'
                    };
                    const activeBgClass = colorMap[colors.from] || 'bg-gray-800';
                    return (
                      <button
                        key={category._id}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                          selectedCategory === category.name
                            ? `${activeBgClass} text-white shadow-lg scale-105`
                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
                        }`}
                      >
                        {language === 'en' ? category.displayName.en : category.displayName.so}
                      </button>
                    );
                  })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {companiesLoading ? (
              <div className="col-span-full text-center py-16 sm:py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 sm:mt-6 text-gray-600 text-sm sm:text-base">
                  {language === 'en' ? 'Loading companies...' : 'Soo gelaya shirkadaha...'}
                </p>
              </div>
            ) : companies.length === 0 ? (
              <div className="col-span-full text-center py-16 sm:py-20">
                <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-sm sm:text-base">
                  {language === 'en' ? 'No companies available yet.' : 'Shirkado ma jiraan hada.'}
                </p>
              </div>
            ) : (
              companies.map((company, index) => (
                <motion.div
                  key={company._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br ${getCardColors(company.businessType).from} ${getCardColors(company.businessType).to} shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer`}
                >
                  {/* Decorative background pattern - using gradient colors instead of white */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-white/30 to-transparent rounded-full -mr-16 -mt-16 sm:-mr-20 sm:-mt-20 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-white/20 to-transparent rounded-full -ml-12 -mb-12 sm:-ml-16 sm:-mb-16 blur-2xl"></div>
                  </div>

                  {/* Discount Badge - Top Right */}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg">
                      <div className="flex flex-col items-center">
                        <span className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 leading-none">
                          {company.discountRate}%
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wide">
                          {language === 'en' ? 'OFF' : 'DHIMIS'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="relative p-4 sm:p-5 lg:p-6 text-white min-h-[280px] sm:min-h-[320px] flex flex-col">
                    {/* Logo Section */}
                    <div className="flex-1 flex items-center justify-center mb-3 sm:mb-4">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 flex items-center justify-center relative bg-black/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 group-hover:bg-black/20 transition-all duration-300 border border-white/10">
                        {company.logo && company.logo.trim() !== '' ? (
                          <img
                            src={company.logo}
                            alt={`${company.businessName} logo`}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                            style={{
                              backgroundColor: 'transparent',
                              imageRendering: 'auto',
                              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                              mixBlendMode: 'normal'
                            }}
                            onLoad={(e) => {
                              const img = e.currentTarget;
                              img.style.backgroundColor = 'transparent';
                              img.style.display = 'block';
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const icon = document.createElement('div');
                                icon.className = 'w-full h-full flex items-center justify-center';
                                icon.innerHTML = '<svg class="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 text-white/80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>';
                                parent.appendChild(icon);
                              }
                            }}
                          />
                        ) : (
                          <Building2 className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 text-white/80" />
                        )}
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="flex-shrink-0">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 line-clamp-2 leading-tight">
                        {company.businessName}
                      </h3>
                      
                      {company.description && (
                        <p className="text-white text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed opacity-95">
                          {company.description}
                        </p>
                      )}

                      {/* Location */}
                      <div className="flex items-start gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-white/30">
                        <span className="text-base sm:text-lg flex-shrink-0">📍</span>
                        <span className="text-xs sm:text-sm text-white leading-relaxed line-clamp-2 flex-1 font-medium">
                          {company.branches?.[0]?.address || company.location || 'Mogadishu'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover overlay effect - subtle darkening */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </motion.div>
              ))
            )}
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
            <div className="flex justify-center mb-4">
              <img
                src={selectedUserImage.imageUrl}
                alt={selectedUserImage.user.fullName}
                className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  console.log('Profile picture failed to load in modal:', selectedUserImage.imageUrl);
                  e.currentTarget.src = '/icons/founder.jpeg';
                }}
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
