import React from 'react'

const Hero = () => {
    return (
        <section className="py-16 md:py-24">
            <div
                className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-4 text-center"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(18, 18, 18, 0.6) 0%, rgba(18, 18, 18, 0.9) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-WvfJDF4LzSCSW9jMRlS5qLE3Hg9wWuAlRVwrc0dLAPFd7Kg3bnSBQdcXeC-vlDWo9ahvrQKum8q1cT05OwRaB9PDlkgfCgxO61WIj5TCrCrSSaN7Dvv37JG4F1Vz8cEnIN0yiUotSfB7VAdgyGfO41ROPzL9b8ut19p2FzKV3kPH9vaFJutI4GRFsmxglvy-bOIDpQaHbZEl3EbSXdldbMBT_5eQ7XhptbuMQNWxpbJ0cyBv-M3COpheYuFS6zQv0u_iU3LK3HRq')",
                }}
                aria-label="Hero background"
            >
                <div className="flex flex-col gap-4 max-w-2xl">
                    <h1 className="theme-text text-5xl font-black leading-tight tracking-tighter md:text-7xl">Elegance Redefined</h1>
                    <h2 className="text-muted text-base font-normal leading-normal md:text-lg">
                        Discover our new collection of premium products, crafted with passion and precision.
                    </h2>
                </div>
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-base font-bold leading-normal tracking-[0.015em] transition-transform duration-200 hover:scale-105 mt-4"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
                    <span className="truncate">Shop The Collection</span>
                </button>
            </div>
        </section>
    )
}

export default Hero
