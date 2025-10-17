import gmail from "../assets/gmail-svgrepo-com.svg";
import github from "../assets/github-mark-white.svg";

const Footer = () => {
    return (
        <section
            id="contact"
            className="mt-32 border-t border-white/10 pt-16"
        >
            <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left gap-10">

                {/* Left section */}
                <div className="flex flex-col items-center md:items-start space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight font-heading">
                        Let's Connect
                    </h2>

                    <p className="text-lg text-gray-400 font-display max-w-md">
                        I'm currently open to new opportunities.
                    </p>
                    <p className="text-lg text-gray-400 font-display max-w-md">
                        Connect with me on LinkedIn or send me an email.
                    </p>

                    {/* Social Icons */}
                    <div className="flex justify-center md:justify-start gap-6 mt-2">
                        <a
                            href="mailto:junaid.dev@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src={gmail}
                                alt="Gmail"
                                className="w-8 h-8 hover:scale-110 transition-transform"
                            />
                        </a>
                        <a
                            href="https://github.com/junii03"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src={github}
                                alt="GitHub"
                                className="w-8 h-8 hover:scale-110 transition-transform"
                            />
                        </a>
                    </div>
                </div>

                {/* Right section: LinkedIn Badge */}
                <div className="flex justify-center md:justify-end w-full md:w-auto">
                    <div className="scale-90 md:scale-100 transform origin-center">
                        <div
                            className="badge-base LI-profile-badge"
                            data-locale="en_US"
                            data-size="large"
                            data-theme="dark"
                            data-type="HORIZONTAL"
                            data-vanity="junaiddev"
                            data-version="v1"
                        >
                            <a
                                className="badge-base__link LI-simple-link"
                                href="https://pk.linkedin.com/in/junaiddev?trk=profile-badge"
                            ></a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Text */}
            <div className="mt-10 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Junaid Afzal. All rights reserved.
            </div>
        </section>
    );
};

export default Footer;
