import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useTheme } from '../../contexts/ThemeContext.tsx';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            {language === 'en' ? 'Profile Settings' : 'Dejinta Profile'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'en' 
              ? 'Manage your personal information and account settings.'
              : 'Maamul macluumaadkaaga shakhsiyeed iyo dejinta akoonka.'
            }
          </p>
        </motion.div>

        <div className="glass-card p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {language === 'en' ? 'Personal Information' : 'Macluumaadka Shakhsiyeed'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'Full Name' : 'Magaca Buuxa'}
              </label>
              <p className="text-gray-900">{user?.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'Email' : 'Email'}
              </label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'Phone' : 'Telefoon'}
              </label>
              <p className="text-gray-900">{user?.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'ID Number' : 'Lambarka Aqoonsiga'}
              </label>
              <p className="text-gray-900">{user?.idNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'Location' : 'Goobta'}
              </label>
              <p className="text-gray-900">{user?.location}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'en' ? 'Account Type' : 'Nooca Akoonka'}
              </label>
              <p className="text-gray-900 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;