import React from 'react'

const Contact = () => {
    return (
        <section className="px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
                <h3 className="theme-text text-2xl font-bold mb-3">Get in touch</h3>
                <p className="text-muted mb-6">Have questions about a product or need help? Send us a message and we’ll respond within 24 hours.</p>
                <form className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                    <input className="rounded-lg p-3 w-full sm:w-auto flex-1 bg-surface border border-theme theme-text" placeholder="Your email" aria-label="Your email" />
                    <button type="submit" className="rounded-lg px-6 py-3 font-bold" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>Subscribe</button>
                </form>
            </div>
        </section>
    )
}

export default Contact
