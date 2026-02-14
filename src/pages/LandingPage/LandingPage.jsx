import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Features from './components/Features';
import Steps from './components/Steps';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';
import './styles/LandingPage.css';

export default function LandingPage() {
    return (
        <div className="landing-page">
            <Navbar />
            <main>
                <Hero />
                <Stats />
                <Features />
                <Steps />
                <Testimonials />
                <Pricing />
                <FAQ />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}
