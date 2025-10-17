import portfolio from "../assets/Screenshot 2025-10-18 at 1.46.26 AM.png";
import firebase from "../assets/firebase.svg";
import flutter from '../assets/flutter.svg'
import seafarer from "../assets/connecting-seafarer.jpeg";
import zakis from "../assets/Screenshot 2025-10-18 at 2.11.42 AM.png";
import react from "../assets/react-svgrepo-com.svg";
import tailwind from '../assets/tailwind-svgrepo-com.svg'
import ProjectCard from "./ProjectCard";
const Projects = () => {
    return (
        <section className="mt-32" id="projects">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight font-heading">My Projects</h2>
                <p className="mt-2 text-lg text-gray-400 font-display">A selection of my recent work.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ProjectCard
                    image={portfolio}
                    title="Portfolio App"
                    alt="Screenshot of a Portfolio app showing my work."
                    description="My Personal Portfolio showcasing my work."
                    techStack={[
                        { src: react, alt: "React Logo" },
                        { src: tailwind, alt: "Tailwind Logo" }
                    ]}
                    link="https://junaidafzal.dev/"
                />

                <ProjectCard
                    image={zakis}
                    title="E-Commerce App"
                    alt="Screenshot of an E-Commerce app for buying and selling scents."
                    description="An E-Commerce app for buying and selling scents."
                    techStack={[
                        { src: firebase, alt: "Firebase Logo" },
                        { src: react, alt: "React Logo" }
                    ]}
                    link="https://zakisessence.pk/"
                />
                <ProjectCard
                    image={seafarer}
                    title="Social Media Platform"
                    alt="Screenshot of a Social Media app for Seafarers"
                    description="A Social Media app for Seafarers"
                    techStack={[
                        { src: flutter, alt: "React Native Logo" },
                        { src: firebase, alt: "Firebase Logo" }
                    ]}
                    link="https://play.google.com/store/apps/details?id=com.marinoft.connecting_seafarer"
                />

            </div>
        </section>
    )
}

export default Projects
