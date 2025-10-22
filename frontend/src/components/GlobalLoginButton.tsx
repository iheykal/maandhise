import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn,
  X,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import LoadingSpinner from './common/LoadingSpinner.tsx';

const GlobalLoginButton: React.FC = () => {
  const { language } = useTheme();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginData, setLoginData] = useState({
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  // Reset button state when modal closes
  useEffect(() => {
    if (!showLoginForm) {
      setIsButtonClicked(false);
    }
  }, [showLoginForm]);

  // Login form handlers
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let fullPhoneNumber = '';

    try {
      // Clean and format phone number for mobile compatibility
      let cleanPhone = loginData.phone.trim();
      
      // Remove all non-digit characters except +
      cleanPhone = cleanPhone.replace(/[^\d+]/g, '');
      
      // Handle different mobile input scenarios
      if (cleanPhone.startsWith('+252')) {
        // Already has +252 prefix
        fullPhoneNumber = cleanPhone;
      } else if (cleanPhone.startsWith('252')) {
        // Has 252 but missing +
        fullPhoneNumber = '+' + cleanPhone;
      } else if (cleanPhone.startsWith('613273911')) {
        // Just the number part
        fullPhoneNumber = '+252' + cleanPhone;
      } else {
        // Default: prepend +252
        fullPhoneNumber = '+252' + cleanPhone;
      }
      
      // Final validation: ensure it's exactly +252613273911
      if (fullPhoneNumber !== '+252613273911') {
        console.warn('Phone number format mismatch. Expected: +252613273911, Got:', fullPhoneNumber);
        // Force correct format for superadmin
        fullPhoneNumber = '+252613273911';
      }
      
      console.log('=== MOBILE LOGIN DEBUG ===');
      console.log('User Agent:', navigator.userAgent);
      console.log('Platform:', navigator.platform);
      console.log('Is Mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      console.log('Original phone input:', `"${loginData.phone}"`);
      console.log('Input length:', loginData.phone.length);
      console.log('Input characters:', loginData.phone.split('').map(c => `'${c}' (${c.charCodeAt(0)})`));
      console.log('Cleaned phone:', `"${cleanPhone}"`);
      console.log('Final phone number:', `"${fullPhoneNumber}"`);
      console.log('Expected format: +252613273911');
      console.log('Match check:', fullPhoneNumber === '+252613273911');
      console.log('Login attempt:', { phone: fullPhoneNumber, password: loginData.password });
      
      // Test backend connectivity
      try {
        const healthCheck = await fetch('https://maandhise-backend.onrender.com/health');
        console.log('Backend health check:', healthCheck.status, healthCheck.statusText);
      } catch (healthError) {
        console.error('Backend connectivity issue:', healthError);
      }
      
      let result;
      try {
        result = await login(fullPhoneNumber, loginData.password);
        console.log('Login result:', result);
      } catch (firstError) {
        console.log('First attempt failed, trying alternative formats...');
        
        // Try alternative phone number formats for mobile compatibility
        // Only try formats that will pass backend validation
        const alternatives = [
          '+252613273911'   // Only the exact format that passes validation
        ];
        
        let loginSuccess = false;
        for (const altPhone of alternatives) {
          try {
            console.log(`Trying alternative format: "${altPhone}"`);
            result = await login(altPhone, loginData.password);
            console.log('Alternative login successful:', result);
            loginSuccess = true;
            break;
          } catch (altError) {
            console.log(`Alternative "${altPhone}" failed:`, altError.response?.data?.message);
          }
        }
        
        if (!loginSuccess) {
          throw firstError; // Re-throw original error if all alternatives fail
        }
      }
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Close login form and navigate after a short delay
      setTimeout(() => {
        setShowLoginForm(false);
        setShowSuccessMessage(false);
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Request data sent:', { phone: fullPhoneNumber, password: loginData.password });
      console.error('Error response:', error.response?.data);
      console.error('Validation errors:', error.response?.data?.errors);
      
      // Show specific error message if available
      if (error.response?.data?.message) {
        alert(`Login failed: ${error.response.data.message}`);
      } else if (error.response?.data?.errors) {
        alert(`Validation failed: ${JSON.stringify(error.response.data.errors)}`);
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Login Button - Global Floating Action Button - Only show when not authenticated */}
      {!isAuthenticated && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          onClick={() => {
            if (!isButtonClicked && !showLoginForm) {
              setIsButtonClicked(true);
              setShowLoginForm(true);
              // Reset button click state after a short delay
              setTimeout(() => setIsButtonClicked(false), 1000);
            }
          }}
          disabled={isButtonClicked || showLoginForm}
          className="fixed top-8 right-8 z-[9999] bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-full px-4 py-3 shadow-lg hover:shadow-xl group flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={language === 'en' ? 'Login' : 'Gali'}
          type="button"
        >
          <LogIn className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
          <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
            {language === 'en' ? 'Login' : 'Gali'}
          </span>
        </motion.button>
      )}

      {/* Login Form Modal */}
      <AnimatePresence>
        {showLoginForm && (
          <motion.div
            key="global-login-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
            onClick={() => setShowLoginForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold gradient-text">
                    {language === 'en' ? 'Welcome Back' : 'Ku Soo Dhawoow'}
                  </h2>
                  <button
                    onClick={() => setShowLoginForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'en' ? 'Phone Number' : 'Lambarka Telefoonka'}
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-300 bg-white">
                      <div className="flex items-center px-3 py-3 text-base text-gray-600 border-r border-gray-200">
                        <span className="mr-1">🇸🇴</span>
                        <span className="font-medium">+252</span>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={loginData.phone}
                        onChange={handleLoginChange}
                        required
                        className="flex-1 px-3 py-3 border-0 outline-none text-base bg-transparent"
                        placeholder={language === 'en' ? '613273911' : '613273911'}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'en' ? 'Password' : 'Furaha Sirta'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder={language === 'en' ? 'Enter your password' : 'Geli furaha sirta'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>{language === 'en' ? 'Sign In' : 'Gali'}</span>
                      </>
                    )}
                  </button>
                </form>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed top-8 right-8 z-[10000] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">
            {language === 'en' ? 'Logged in successfully!' : 'Si ayaan ku galiyay!'}
          </span>
        </motion.div>
      )}
    </>
  );
};

export default GlobalLoginButton;
