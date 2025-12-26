import TopNavigation from '../components/home/TopNavigation'
import MainHeader from '../components/home/MainHeader'
import MainContent from '../components/home/MainContent'
import ServicesSection from '../components/home/ServicesSection'
import WhatsAppButton from '../components/home/WhatsAppButton'
import MobileAppsSection from '../components/home/MobileAppsSection'

export default function Home() {
    return (
        <>
            <TopNavigation />
            {/* Add padding-top to account for fixed navigation */}
            <div className="pt-12">
                <MainHeader />
                <MainContent />
                <ServicesSection />
                <WhatsAppButton />

                <MobileAppsSection />
            </div>
        </>
    )
}
