import whatsappIcon from '/src/assets/Whatsapp-icon.png'; // Adjust the path as necessary

export default function WhatsAppButton() {
    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg theme-whatsapp-btn theme-focus-ring"
                aria-label="Contact us on WhatsApp"
            >
                <img
                    src={whatsappIcon}
                    alt="WhatsApp"
                    className="w-8 h-8"
                />
            </button>
        </div>
    )
}
