import React from 'react';
import { motion } from 'framer-motion';
import { Phone, QrCode } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.tsx';

interface VirtualSahalCardProps {
  cardNumber?: string;
  expiryDate?: string;
  className?: string;
}

const VirtualSahalCard: React.FC<VirtualSahalCardProps> = ({ 
  cardNumber = "ID.001", 
  expiryDate = "2026/12/31",
  className = ""
}) => {
  const { language } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative w-80 h-48 mx-auto ${className}`}
      style={{ perspective: '1000px' }}
    >
      {/* Card Container */}
      <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden transform-gpu">
        {/* Card Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl">
          {/* Left Section (Blue) - 2/3 of card */}
          <div className="absolute left-0 top-0 w-2/3 h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-l-2xl">
            {/* Company Name */}
            <div className="absolute top-3 left-4 text-white text-xs font-medium opacity-90">
              MAANDHISE CORPORATE SOMALIA
            </div>
            
            {/* Phone Number */}
            <div className="absolute top-12 left-4 flex items-center gap-2 text-white">
              <Phone className="w-3 h-3" />
              <span className="text-sm font-medium">+252 613 273 911</span>
            </div>
            
            {/* Benefits List */}
            <div className="absolute top-20 left-4 space-y-2">
              <div className="flex items-center gap-2 text-white text-sm">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="font-medium">Keyd badan</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="font-medium">Kharash Yar</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="font-medium">Save more</span>
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="font-medium">Spend less</span>
              </div>
            </div>
            
            {/* Orange Vertical Bar */}
            <div className="absolute right-0 top-16 w-1 h-20 bg-orange-400 rounded-l-full"></div>
          </div>
          
          {/* Right Section (White) - 1/3 of card */}
          <div className="absolute right-0 top-0 w-1/3 h-full bg-white rounded-r-2xl">
            {/* QR Code Placeholder */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '8px 8px'
              }}></div>
            </div>
          </div>
          
          {/* Bottom Section - Card Title */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-b-2xl flex flex-col justify-center items-center">
            <div className="text-white font-bold text-sm tracking-wide">
              SAHAL DISCOUNT CARD
            </div>
            <div className="text-blue-200 text-xs font-medium">
              BY MAANDHISE CORPORATE
            </div>
          </div>
          
          {/* Card Number */}
          <div className="absolute top-4 right-4 text-blue-800 font-bold text-lg">
            {cardNumber}
          </div>
          
          {/* Expiry Date */}
          <div className="absolute bottom-4 right-4 text-blue-800 text-xs font-medium">
            EXP {expiryDate}
          </div>
          
          {/* Subtle Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl"></div>
          
          {/* Card Border */}
          <div className="absolute inset-0 border-2 border-white/20 rounded-2xl"></div>
        </div>
        
        {/* Hover Effect */}
        <motion.div
          whileHover={{ 
            scale: 1.05,
            rotateY: 5,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-2xl cursor-pointer"
        />
      </div>
      
      {/* Card Reflection */}
      <div className="absolute -bottom-2 left-2 right-2 h-4 bg-gradient-to-t from-black/20 to-transparent rounded-b-2xl blur-sm"></div>
    </motion.div>
  );
};

export default VirtualSahalCard;
