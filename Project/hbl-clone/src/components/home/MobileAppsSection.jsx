import { useState } from 'react';
import MobileAppCard from './MobileAppCard';
import hblMobileImage from '/src/assets/botg-hbl-mobile-night-792x558-ezgif.com-webp-to-png-converter_.webp';
import konnectImage from '/src/assets/homepersonal-konnect-night.webp'; // Uncomment if you have a separate image for Konnect
export default function MobileAppsSection() {
    const [activeTab, setActiveTab] = useState('HBL MOBILE');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (

        <div className="theme-bg p-6 md:p-10 rounded-lg shadow-md">
            <div className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold px-4 sm:px-8 md:px-16 lg:px-24 xl:px-30 py-6 md:py-8 lg:py-10 theme-heading-1">ELEVATE YOUR BANKING EXPERIENCE WITH THE BEST BANK IN PAKISTAN ANYTIME, ANYWHERE</div>

            <div className="flex justify-center mb-6">
                {['HBL MOBILE', 'KONNECT'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabClick(tab)}
                        className={`relative px-4 py-2 mx-1 rounded font-medium transition duration-300 group
                            ${activeTab === tab
                                ? 'text-teal-600 dark:text-teal-400'
                                : 'text-gray-500 dark:text-gray-300'}
                        `}
                    >
                        {tab}
                        {/* Underline animation */}
                        <span
                            className={`absolute left-0 -bottom-1 h-0.5 bg-teal-500 transition-all duration-300
                                ${activeTab === tab ? 'w-full' : 'w-0 group-hover:w-full'}
                            `}
                        />
                    </button>
                ))}
            </div>

            <div className="text-center space-y-2">
                {activeTab === 'HBL MOBILE' ? (
                    <>
                        <MobileAppCard appName="HBL MOBILE" appDescription="BANKING AT YOUR FINGERTIPS" image={hblMobileImage} />
                    </>
                ) : (
                    <>
                        <MobileAppCard appName="KONNECT" appDescription="YOUR PERSONALLIZED BANKING EXPERIENCE" image={konnectImage} />
                    </>
                )}
            </div>
        </div>
    );
}
