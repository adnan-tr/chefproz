import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, 
  Award, 
  Globe, 
  CheckCircle,
  Target,
  Heart,
  Lightbulb
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Target,
      title: t('about.mission_title', 'Our Mission'),
      description: t('about.mission_description', 'To provide world-class kitchen equipment and consultancy services that empower culinary professionals to achieve excellence.'),
    },
    {
      icon: Heart,
      title: t('about.values_title', 'Our Values'),
      description: t('about.values_description', 'Quality, integrity, innovation, and customer satisfaction are at the core of everything we do.'),
    },
    {
      icon: Lightbulb,
      title: t('about.vision_title', 'Our Vision'),
      description: t('about.vision_description', 'To be the leading global provider of professional kitchen solutions, setting industry standards for quality and service.'),
    },
  ];

  const team = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      experience: '20+ years',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1',
    },
    {
      name: 'Sarah Johnson',
      role: 'Head of Operations',
      experience: '15+ years',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1',
    },
    {
      name: 'Michael Chen',
      role: 'Technical Director',
      experience: '18+ years',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Customer Success Manager',
      experience: '12+ years',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1',
    },
  ];

  const achievements = [
    { icon: Users, value: '500+', label: t('about.satisfied_clients', 'Satisfied Clients') },
    { icon: Award, value: '15+', label: t('about.years_experience', 'Years Experience') },
    { icon: Globe, value: '25+', label: t('about.countries_served', 'Countries Served') },
    { icon: CheckCircle, value: '1000+', label: t('about.projects_completed', 'Projects Completed') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section with Abstract Background */}
      <section className="product-hero-abstract text-white py-20">
        <div className="relative px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-5xl font-bold mb-6">
            {t('nav.about')}
          </h1>
          <p className="text-xl leading-relaxed opacity-90">
            {t('about.hero_description', 'ChefGear has been at the forefront of professional kitchen solutions for over 15 years, providing exceptional equipment and consultancy services to culinary professionals worldwide.')}
          </p>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8 py-16">
        {/* Company Story */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-800 mb-8 flex items-center">
                <span className="w-2 h-10 bg-gradient-to-b from-red-500 to-red-600 rounded-full mr-4"></span>
                {t('about.our_story', 'Our Story')}
              </h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
                <p>
                  {t('about.story_paragraph_1', 'Founded in 2009, ChefGear began as a small family business with a simple mission: to provide professional chefs and restaurateurs with the highest quality kitchen equipment and expert guidance they need to succeed.')}
                </p>
                <p>
                  {t('about.story_paragraph_2', 'Over the years, we\'ve grown from a local supplier to an international consultancy, working with restaurants, hotels, catering companies, and industrial kitchens across 25 countries. Our success is built on understanding that every kitchen is unique, and every client deserves personalized solutions.')}
                </p>
                <p>
                  {t('about.story_paragraph_3', 'Today, ChefGear stands as a trusted partner in the culinary industry, combining traditional craftsmanship with cutting-edge technology to deliver solutions that exceed expectations.')}
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/2313737/pexels-photo-2313737.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1"
                alt="Professional Kitchen"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">{t('about.core_values_title', 'Our Core Values')}</h2>
            <p className="text-xl text-slate-600">
              {t('about.core_values_subtitle', 'The principles that guide everything we do')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="elegant-card text-center group">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-20 bg-gradient-to-br from-red-600 via-red-500 to-red-600 text-white rounded-2xl p-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">{t('about.achievements_title', 'Our Achievements')}</h2>
            <p className="text-xl opacity-90">
              {t('about.achievements_subtitle', 'Numbers that reflect our commitment to excellence')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-105">
                    <Icon className="h-10 w-10" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{achievement.value}</div>
                  <div className="text-sm opacity-90">{achievement.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Team */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">{t('about.team_title', 'Meet Our Team')}</h2>
            <p className="text-xl text-slate-600">
              {t('about.team_subtitle', 'The experts behind ChefGear\'s success')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="elegant-card text-center group">
                <CardContent className="p-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-red-600 font-semibold mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-slate-600">
                    {member.experience}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="elegant-card p-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              {t('about.cta_title', 'Ready to Work With Us?')}
            </h2>
            <p className="text-xl text-slate-600 mb-10">
              {t('about.cta_subtitle', 'Let\'s discuss how ChefGear can help transform your kitchen operations')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="btn-primary inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                {t('about.get_in_touch', 'Get in Touch')}
              </a>
              <a
                href="/special-request"
                className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                {t('about.view_services', 'View Services')}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;