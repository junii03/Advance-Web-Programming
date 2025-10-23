const ProjectCard = ({ image, title, alt, description, link, techStack = [] }) => {
    return (
        <div className="group relative overflow-hidden rounded-xl glassmorphic cursor-pointer transform hover:-translate-y-2 transition-transform duration-300"

            onClick={
                () => { window.open(link, "_blank") }
            }>
            <img
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                src={image}
                alt={alt}
            />
            <div className="p-6">
                <h3 className="text-xl font-bold font-display">{title}</h3>
                <p className="mt-2 text-sm text-gray-400">{description}</p>
                <div className="mt-4 flex gap-2">
                    {techStack.map((tech, index) => (
                        <img key={index} src={tech.src} alt={tech.alt} className="w-5 h-5" />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ProjectCard
