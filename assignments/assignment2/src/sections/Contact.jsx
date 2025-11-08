import React, { useState } from 'react'


const Contact = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!email.trim()) {
            alert('Please enter a valid email address.');
            return;
        }
        alert('Thank you for subscribing!');
        setEmail('');
    };

    return (
        <section className="px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
                <h3 className="theme-text text-2xl font-bold mb-3">Get in touch</h3>
                <p className="text-muted mb-6">Have questions about a product or need help? Send us a message and we’ll respond within 24 hours.</p>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-lg
                     p-3 w-full sm:w-auto flex-1 bg-surface border border-theme theme-text" placeholder="Your email"
                        aria-label="Your email" />
                    <button type="submit" className="primary shadow-md py-3 px-6 rounded-lg cursor-pointer" >Subscribe</button>
                </form>
            </div>
        </section>
    )
}

export default Contact
