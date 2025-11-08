import React from 'react'

const GalleryCard = ({ title, price, image, alt, category, description }) => {
    return (
        <div className="flex flex-col gap-4 pb-3 bg-surface rounded-xl p-4 transition-transform duration-200 hover:-translate-y-2 border border-theme">
            <div
                className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
                style={{ backgroundImage: `url('${image}')` }}
                role="img"
                aria-label={alt}

            />

            <div>
                <p className="theme-text text-lg font-medium leading-normal">{title}</p>
                <p className="text-muted text-base font-normal leading-normal">{price} $</p>
                <p className="text-muted text-sm font-normal leading-normal">{category}</p>
                <p className="text-muted text-sm font-normal leading-normal">{description}</p>
            </div>
        </div>
    )
}

export default GalleryCard
