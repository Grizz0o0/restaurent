'use client';

import HeroSection from '@/components/sections/HeroSection';
import MenuSection from '@/components/sections/MenuSection';
import AboutSection from '@/components/sections/AboutSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ContactSection from '@/components/sections/ContactSection';

const Index = () => {
    return (
        <div className="min-h-screen bg-background">
            <HeroSection />
            <MenuSection />
            <AboutSection />
            <TestimonialsSection />
            <ContactSection />
        </div>
    );
};

export default Index;
