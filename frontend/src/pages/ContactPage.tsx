import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.tsx';

const ContactPage: React.FC = () => {
  const { language } = useTheme();

  const contactInfo = [
    {
      icon: Phone,
      title: language === 'en' ? 'Phone' : 'Telefoon',
      value: '+252 613 273 911',
      link: 'https://wa.me/252613273911',
      description: language === 'en' ? 'WhatsApp Available' : 'WhatsApp Waa La Heli Karaa'
    },
    {
      icon: Mail,
      title: language === 'en' ? 'Email' : 'Email',
      value: 'Maandhisecorporate@gmail.com',
      link: 'mailto:Maandhisecorporate@gmail.com',
      description: language === 'en' ? 'Send us an email' : 'Noo dir email'
    },
    {
      icon: MapPin,
      title: language === 'en' ? 'Location' : 'Goobta',
      value: language === 'en' ? 'Mogadishu, Somalia' : 'Muqdisho, Soomaaliya',
      link: '#',
      description: language === 'en' ? 'Visit our office' : 'Booqo xafiiska'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            {language === 'en' ? 'Contact Us' : 'La Xidhiidh'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {language === 'en' 
              ? 'Get in touch with us for any questions, support, or business inquiries. We\'re here to help!'
              : 'La xidhiidh naga soo hadal su\'aalaha, taageerada, ama su\'aalaha ganacsiga. Waxaan halkan joognaa si aan ku caawino!'
            }
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {contactInfo.map((contact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm border border-white/50 hover:border-white/70 transition-all duration-500 hover:shadow-2xl"
            >
              <div className="relative p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <contact.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {contact.title}
                </h3>
                
                <a
                  href={contact.link}
                  target={contact.link.startsWith('http') ? '_blank' : '_self'}
                  rel={contact.link.startsWith('http') ? 'noopener noreferrer' : ''}
                  className="text-lg text-blue-600 hover:text-blue-700 font-semibold mb-2 block transition-colors duration-300"
                >
                  {contact.value}
                </a>
                
                <p className="text-gray-600 text-sm">
                  {contact.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

export default ContactPage;
