import { projects } from "../constants/constants";
import ProjectCard from "./ProjectCard";
const Projects = () => {



    return (
        <section className="mt-32 px-4" id="projects">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight font-heading">My Projects</h2>
                <p className="mt-2 text-lg text-gray-400 font-display">A selection of my recent work.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">

                {/* Render Project Cards */}
                {projects.map((project, index) => (
                    <ProjectCard
                        key={index}
                        image={project.image}
                        title={project.title}
                        alt={project.alt}
                        description={project.description}
                        link={project.link}
                        techStack={project.techStack}
                    />
                ))}

            </div>
        </section>
    )
}

export default Projects
