import React from 'react'
import heroImage from '../assets/hero.png'

const Hero = () => {
    return (
        <section className="relative py-16 md:py-24">
            <div
                className="relative flex min-h-[580px] flex-col gap-6 items-center justify-center p-4 text-center rounded-xl overflow-hidden"
            >
                {/* Background image */}
                <img
                    src={heroImage}
                    alt=""
                    className="absolute inset-0 h-full w-full object-fill "
                />

            </div>
        </section>
    )
}

export default Hero
