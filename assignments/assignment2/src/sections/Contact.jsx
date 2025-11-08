import React, { useState } from 'react'


const Contact = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');


    const handleSubmit = (event) => {
        event.preventDefault();
        if (!email.trim() || !name.trim() || !message.trim()) {
            alert('Please fill in all fields.');
            return;
        }
        alert('Thank you for subscribing!');
        console.log({ email, name, message });
        setEmail('');
        setName('');
        setMessage('');
    };

    return (
        <section className="px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
                <h3 className="theme-text text-2xl font-bold mb-3">Get in touch</h3>
                <p className="text-muted mb-6">Have questions about a product or need help? Send us a message and we’ll respond within 24 hours.</p>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 "
                >
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-lg p-3 w-full sm:w-auto flex-1 bg-surface border border-theme theme-text"
                        placeholder="Your email"
                        aria-label="Your email" />
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-lg p-3 w-full sm:w-auto flex-1 bg-surface border border-theme theme-text"
                        placeholder="Your Name"
                        aria-label="Your Name" />
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows="4"
                        className="rounded-lg p-3 w-full sm:w-auto flex-1 bg-surface border border-theme theme-text"
                        placeholder="Your message"
                        aria-label="Your message"
                    ></textarea>
                    <button type="submit" className="primary max-w-md mx-auto shadow-md py-3 px-6 rounded-lg cursor-pointer" >Subscribe</button>
                </form>
            </div>
        </section>
    )
}

export default Contact
