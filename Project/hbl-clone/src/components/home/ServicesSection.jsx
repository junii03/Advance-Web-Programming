import ServiceCard from "./ServiceCard"
import branchLocator from '/src/assets/Branch_locator_1.svg';
import complaint from '/src/assets/customer_assistance_1.svg';
import iban from '/src/assets/Remittance_tracker_1.svg';
import security from '/src/assets/information_security-205.svg';
import psl from '/src/assets/Trophy-home.svg';
import remitteance from '/src/assets/Remittance_tracker_1.svg';

export default function ServicesSection() {
    const services = [
        {
            id: 1,
            icon: (
                <img src={psl} alt="HBL PSL" className="w-6 h-6 md:w-8 md:h-8" />
            ),
            title: "HBLPSL"
        },
        {
            id: 2,
            icon: (
                <img src={branchLocator} alt="Branch Locator" className="w-6 h-6 md:w-8 md:h-8" />
            ),
            title: "BRANCH",
            subtitle: "LOCATOR"
        },
        {
            id: 3,
            icon: (
                <img src={complaint} alt="Customer Complaints" className="w-6 h-6 md:w-8 md:h-8" />
            ),
            title: "CUSTOMER",
            subtitle: "COMPLAINTS"
        },
        {
            id: 4,
            icon: (
                <img src={iban} alt="IBAN Generator" className="w-6 h-6 md:w-8 md:h-8" />
            ),
            title: "IBAN",
            subtitle: "GENERATOR"
        },
        {
            id: 5,
            icon: (
                <img src={security} alt="Information Security" className="w-6 h-6 md:w-8 md:h-8" />
            ),
            title: "INFORMATION",
            subtitle: "SECURITY"
        },
        {
            id: 6,
            icon: (
                <img src={remitteance} alt="Remittance Tracker" className="w-6 h-6 md:w-8 md:h-8" />
            ),
            title: "REMITTANCE",
            subtitle: "TRACKER"
        }
    ]

    return (
        <footer className="border-t py-6 md:py-8 theme-footer transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            icon={service.icon}
                            title={service.title}
                            subtitle={service.subtitle}
                        />
                    ))}
                </div>
            </div>
        </footer>
    )
}
