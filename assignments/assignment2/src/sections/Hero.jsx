import React from 'react'
import heroImage from '../assets/hero.png'

const Hero = () => {
    return (
        <section className="relative py-16 md:py-24">
            <div
                className="relative flex min-h-[480px] flex-col gap-6 items-center justify-center p-4 text-center rounded-xl overflow-hidden"
            >
                {/* Background image */}

                <img
                    src={heroImage}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-70"
                />



                {/* Content */}
                <div className="flex flex-col gap-4 max-w-2xl z-10">
                    <h1 className="theme-text text-5xl font-black leading-tight tracking-tighter md:text-7xl">
                        Elegance Redefined
                    </h1>
                    <h2 className="text-muted text-base font-normal leading-normal md:text-lg">
                        Discover our new collection of premium products, crafted with passion and precision.
                    </h2>
                </div>

                <button
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-base font-bold leading-normal tracking-[0.015em] transition-transform duration-200 hover:scale-105 mt-4 z-10"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                >
                    <span className="truncate">Shop The Collection</span>
                </button>
            </div>
        </section>
    )
}

export default Hero
