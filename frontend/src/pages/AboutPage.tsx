import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  // Target, 
  // Eye, 
  Users, 
  Award, 
  // Heart, 
  // Globe, 
  // Shield, 
  Zap,
  TrendingUp,
  Briefcase,
  CreditCard
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.tsx';

const AboutPage: React.FC = () => {
  const { language } = useTheme();

  // const values = [
  //   {
  //     icon: Heart,
  //     title: language === 'en' ? 'Community First' : 'Bulshada Hore',
  //     description: language === 'en' 
  //       ? 'We prioritize the needs and growth of our community above all else.'
  //       : 'Waxaan u horaynaa baahida iyo koritaanka bulshadeena dhammaan waxyaabaha kale.',
  //     color: 'from-red-500 to-pink-500'
  //   },
  //   {
  //     icon: Shield,
  //     title: language === 'en' ? 'Trust & Security' : 'Aamin & Ammaan',
  //     description: language === 'en' 
  //       ? 'Your data and transactions are protected with enterprise-grade security.'
  //       : 'Xogtaada iyo dhaqdhaqaaqyada way aamisan yihiin iyadoo la adeegsanayo ammaanka heerka shirkadda.',
  //     color: 'from-blue-500 to-cyan-500'
  //   },
  //   {
  //     icon: Zap,
  //     title: language === 'en' ? 'Innovation' : 'Cusboonaysi',
  //     description: language === 'en' 
  //       ? 'We continuously innovate to provide cutting-edge solutions for our users.'
  //       : 'Waxaan si joogto ah u cusboonaysiinaynaa si aan u bixino xalalka ugu horreeya istcmaalayaashayada.',
  //     color: 'from-yellow-500 to-orange-500'
  //   },
  //   {
  //     icon: Globe,
  //     title: language === 'en' ? 'Accessibility' : 'Helitaanka',
  //     description: language === 'en' 
  //       ? 'Making quality services accessible to everyone across Somalia.'
  //       : 'Ka dhigista adeegyo tayo leh oo dhammaan dadka Soomaaliya oo dhan ay heli karaan.',
  //     color: 'from-green-500 to-emerald-500'
  //   }
  // ];


  // const team = [
  //   {
  //     name: language === 'en' ? 'Leadership Team' : 'Kooxda Hogaanka',
  //     role: language === 'en' ? 'Visionary Leaders' : 'Hogaamiya Aragti',
  //     description: language === 'en' 
  //       ? 'Experienced professionals driving innovation and growth.'
  //       : 'Xirfadlayaal khibrad leh oo dhiirigelinaya cusboonaysi iyo koritaan.'
  //   },
  //   {
  //     name: language === 'en' ? 'Development Team' : 'Kooxda Horumarinta',
  //     role: language === 'en' ? 'Tech Innovators' : 'Cusboonaysiyeenka Teknoolojiga',
  //     description: language === 'en' 
  //       ? 'Skilled developers creating cutting-edge solutions.'
  //       : 'Horumarayaal xirfad leh oo sameeya xalalka ugu horreeya.'
  //   },
  //   {
  //     name: language === 'en' ? 'Support Team' : 'Kooxda Taageerada',
  //     role: language === 'en' ? 'Customer Champions' : 'Garaadka Macaamiisha',
  //     description: language === 'en' 
  //       ? 'Dedicated professionals ensuring exceptional customer experience.'
  //       : 'Xirfadlayaal u go\'an oo hubinaya khibrad macaamiil oo gaar ah.'
  //   }
  // ];

  return (
    <>
      <Helmet>
        <title>About SAHAL CARDS - Our Story, Mission & Vision | Somalia</title>
        <meta name="description" content="Learn about SAHAL CARDS's journey since 2021. Founded by Abdullahi Abdi Elmi, we unite education, consulting & savings for Somalia's future." />
        <meta name="keywords" content="about sahal cards, company story, somalia business, abdullahi abdi elmi, founder, mission, vision, education somalia" />
        <meta name="author" content="SAHAL CARDS" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://maandhise.com/about" />
        <meta property="og:title" content="About SAHAL CARDS - Our Story, Mission & Vision" />
      <meta property="og:description" content="Learn about SAHAL CARDS's journey since 2021. Founded by Abdullahi Abdi Elmi, we unite education, consulting & savings for Somalia's future." />
      <meta property="og:image" content="https://maandhise.com/og-about.png" />
      <meta property="og:site_name" content="SAHAL CARDS" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://maandhise.com/about" />
        <meta property="twitter:title" content="About SAHAL CARDS - Our Story, Mission & Vision" />
      <meta property="twitter:description" content="Learn about SAHAL CARDS's journey since 2021. Founded by Abdullahi Abdi Elmi, we unite education, consulting & savings for Somalia's future." />
        <meta property="twitter:image" content="https://maandhise.com/og-about.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://maandhise.com/about" />
      </Helmet>
      
      <div className="h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 overflow-y-auto">
      {/* Hero Section - HIDDEN */}
      {/* <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
              {language === 'en' ? 'About SAHAL CARDS' : 'Ku Saabsan SAHAL CARDS'}
            </h1>
            
            <div className="flex justify-center items-center mb-8">
              <div className="text-center">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-cyan-500 shadow-lg mb-4">
                  <img 
                    src="/icons/abdalla.jpeg" 
                    alt={language === 'en' ? 'Abdalla - Co-founder of Maandhise Corporate' : 'Abdalla - La Aasaasaha Maandhise Corporate'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-lg text-cyan-600 font-medium">
                  {language === 'en' ? 'Abdalla' : 'Abdalla'}
                </p>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {language === 'en' 
                ? 'Founded in 2021 by Abdullahi Abdi Elmi, Maandhise is a visionary platform built to empower communities through knowledge, technology, and innovative services.'
                : 'La aasaasay 2021-kii Abdullahi Abdi Elmi, Maandhise waa platform aragti leh oo loo dhisay si loo awoodsiinayo bulshada iyadoo la adeegsanayo aqoon, teknooloji, iyo adeegyo cusub.'
              }
            </p>
          </motion.div>
        </div>
      </section> */}

      {/* Mission & Vision Section - HIDDEN */}
      {/* <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-12"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'en' ? 'Our Mission' : 'Ujeedkayaga'}
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                {language === 'en' 
                  ? 'At its core, Maandhise is an educational institute where people can enhance their learning—from academic skills to practical knowledge like ordering from Alibaba. Our goal is to equip learners and entrepreneurs with tools to grow in a modern world.'
                  : 'Qaybta aasaasiga ah, Maandhise waa machad waxbarasho oo dadku ay ku kordhin karaan waxbarashadooda—laga bilaabo xirfadaha akadeemiga ilaa aqoonka dhabta ah sida dalabka Alibaba. Ujeedkayagu waa inaan siinno barayaasha iyo ganacsatada qalabka loo baahan yahay si ay u koraan dunida casriga ah.'
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-12"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mr-4">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {language === 'en' ? 'Our Vision' : 'Aragtidayaga'}
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg">
                {language === 'en' 
                  ? 'Maandhise was born from real community needs. After witnessing challenges in education, online commerce, and access to affordable services, we built Maandhise as a solution-driven platform—bridging gaps and unlocking opportunities.'
                  : 'Maandhise waxay ka dhalatay baahida dhabta ah ee bulshada. Ka dib markii aan arnay caqabadaha waxbarashada, ganacsiga onlaynka, iyo helitaanka adeegyo qiimo jaban, waxaan dhisnay Maandhise platform-ka xalalka dhiirigelinaya—waxaan ku xidhiidhnaa farqiga iyo furitaanka fursadaha.'
                }
              </p>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* Founder & Story Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'en' ? 'Our Story' : 'Sheekadayada'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'From vision to reality - the journey of Sahal Card'
                : 'Laga bilaabo aragti ilaa dhab - socodka Maandhise'
              }
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="glass-card p-8 md:p-12"
            >
              <div className="flex items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mr-6 border-4 border-blue-500">
                  <img 
                    src="/icons/founder.jpeg" 
                    alt={language === 'en' ? 'Abdullahi Abdi Elmi - Founder & CEO of Maandhise Corporate' : 'Abdullahi Abdi Elmi - Aasaasaha & CEO Maandhise Corporate'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {language === 'en' ? 'Abdullahi Abdi Elmi' : 'Abdullahi Abdi Elmi'}
                  </h3>
                  <p className="text-blue-600 font-medium">
                    {language === 'en' ? 'Founder & CEO' : 'Aasaasaha & CEO'}
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-xl border-l-4 border-blue-500">
                <div className="space-y-6">
                  <blockquote className="text-gray-700 italic leading-relaxed text-lg">
                    {language === 'en' 
                      ? '"It is a well-established fact that every business depends on its customers, and customers naturally choose businesses that offer high-quality services and excellent customer support.'
                      : '"Waa run dhabta ah oo la aqoonsaday in dhammaan ganacsigu ay ku tiirsan yihiin macaamiishooda, macaamiishuna si dabiici ah ay doortaan ganacsiga bixinaya adeegyo tayo sare leh iyo taageero macaamiil oo fiican.'
                    }
                  </blockquote>
                  
                  <blockquote className="text-gray-700 italic leading-relaxed text-lg">
                    {language === 'en' 
                      ? 'At SAHAL CARDS, we are honored to introduce one of the most in-demand services: Sahal Card.'
                : 'SAHAL CARDS, waxaan sharaf u nahay in aan soo bandhigno mid ka mid ah adeegyada ugu baahida badan: Kaarka Sahal.'
                    }
                  </blockquote>
                  
                  <blockquote className="text-gray-700 italic leading-relaxed text-lg">
                    {language === 'en' 
                      ? 'Sahal Card is a discount card created to bridge the gap between companies and their customers."'
                      : 'Kaarka Sahal waa kaar qiimo dhimis oo loo sameeyay si loo dhex maro farqiga u dhexeeya shirkadaha iyo macaamiishooda."'
                    }
                  </blockquote>
                </div>
                
                <footer className="text-right mt-8">
                  <cite className="text-blue-600 font-semibold not-italic text-lg">
                    — Abdullahi Abdi Elmi
                  </cite>
                </footer>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Why Choose Maandhise Section */}
      <section className="py-20 bg-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'en' ? 'Why Choose SAHAL CARDS' : 'Maxaad Dooranaysaa SAHAL CARDS'}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {language === 'en' 
                ? 'SAHAL CARDS is a leading Somali organization dedicated to innovation, business growth, and sustainable development. We focus on empowering entrepreneurs, creating jobs, and driving marketing excellence across all sectors.'
                : 'SAHAL CARDS waa urur Soomaali ah oo hore u socda oo u go\'an cusboonaysi, koritaanka ganacsiga, iyo horumarinta joogtada ah. Waxaan diirada saarnay awoodsiinta ganacsatada, abuurista shaqooyinka, iyo horumarinta heerka suuqgeynta dhammaan qaybaha.'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: TrendingUp,
                title: language === 'en' ? '10,000+ Entrepreneurs Launched' : '10,000+ Ganacsade La Bilaabay',
                description: language === 'en' 
                  ? 'Successfully launched over 10,000 entrepreneurs operating in diverse industries nationwide.'
                  : 'Si guul leh ayaa loo bilaabay in ka badan 10,000 ganacsade oo ka shaqeeya warshadaha kala duwan ee dalka oo dhan.'
              },
              {
                icon: Users,
                title: language === 'en' ? 'Thousands of Jobs Created' : 'Kunno Shaqooyin La Aburay',
                description: language === 'en' 
                  ? 'Created employment opportunities for thousands of youth across Somalia.'
                  : 'Waxaa la abuuray fursadaha shaqo ee kunno dhallinyaro ah oo Soomaaliya oo dhan.'
              },
              {
                icon: Award,
                title: language === 'en' ? 'Reputable Partnerships' : 'Iskaashiga Amaan leh',
                description: language === 'en' 
                  ? 'Collaborated with the country\'s most reputable companies including hospitals, banks, and telecom firms.'
                  : 'Waxaa la wada shaqeeyay shirkadaha ugu aaminka badan ee dalka oo ay ku jiraan isbitaallada, bangiyada, iyo shirkadaha isgaarsiinta.'
              },
              {
                icon: Zap,
                title: language === 'en' ? 'Viral Marketing Strategies' : 'Qorshaha Suuqgeynta Viral',
                description: language === 'en' 
                  ? 'Developed creative marketing strategies that made numerous businesses go viral and gain massive visibility.'
                  : 'Waxaa la horumariyay qorshaha suuqgeynta hal-abuurka ah oo ay ku dhigteen ganacsiyo badan in ay noqdaan viral oo ay helaan muuqaal weyn.'
              },
              {
                icon: Briefcase,
                title: language === 'en' ? 'Business Consulting Excellence' : 'Hufnaanta La Taliye Ganacsi',
                description: language === 'en' 
                  ? 'Provided business consulting and strategic advisory services that help startups and SMEs grow sustainably.'
                  : 'Waxaa la bixiyay adeegyo la taliye ganacsi iyo talooyin qorshe oo caawiya mashruucada cusub iyo ganacsiga yar in ay u koraan si joogtada ah.'
              },
              {
                icon: CreditCard,
                title: language === 'en' ? 'Sahal Discount Card' : 'Kaarka Sahal',
                description: language === 'en' 
                  ? 'Introduced the Sahal Discount Card — a smart savings solution connecting businesses and customers under "Save More, Spend Less."'
                  : 'Waxaa la soo bandhigay Kaarka Sahal — xal keydin smart ah oo ku xidhiidha ganacsiga iyo macaamiisha hoos yimaada "Keydin Badan, Qaad Yar."'
              }
            ].map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 hover-lift"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <achievement.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {achievement.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {achievement.description}
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
                  ? 'SAHAL CARDS — Innovation, Opportunity, and Growth for All.'
                : 'SAHAL CARDS — Cusboonaysi, Fursad, iyo Koritaan Dhammaan Dadka.'
              }
              </h3>
            </div>
          </motion.div>
        </div>
      </section>




    </div>
    </>
  );
};

export default AboutPage;