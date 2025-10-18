import React from 'react'

const Skills = ({ image, name, alt }) => {
    return (

        <div className="flex items-center gap-3">
            <img src={image} alt={alt} className="w-5 h-5" />
            <span>{name}</span>
        </div>


    )
}

export default Skills
