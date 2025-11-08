import React from 'react'

const GalleryCard = ({ title, price, image, alt }) => {
    return (
        <div className="flex flex-col gap-4 pb-3 bg-surface rounded-xl p-4 transition-transform duration-200 hover:-translate-y-2 border border-theme shadow-md hover:shadow-2xl cursor-pointer">
            <img src={image} alt={alt} className="w-full h-50 object-fill rounded-lg" />
            <div className="flex flex-1 flex-col">
                <h3 className="theme-text text-lg font-bold mb-1">{title}</h3>

                <div className="mt-auto">

                    <p className="theme-text font-bold text-xl">${price}</p>
                </div>
            </div>
        </div>
    )
}

export default GalleryCard
