import React from 'react'
import GalleryCard from '../components/GalleryCard'

const products = [
    {
        title: 'Aura Headphones',
        price: '$199.99',
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDcGK8RNN4nKgro_NtIqDI-gd4YC2qKdDM_WL2ixjqhYUZVM3dtN41RdIKU_0dLEr3J528-FeTMygPnN-HAU9p-iDWINkzOMEFOoqKs-43sOZAXrFvEiIzFHCg-XgO21WXUyBVLSVDR1zpZ6wmwYR2lCRtGsB4OXGgxpP5HoTekKJ-KBCulGCe02b8-7Q2rFeRNcd-ac6v112k8KiOGvl-rXCStWxcDkOHoZMaAScEgx2fumcdSQWsEiB1IwC5nYYuJLSlufcf8tFFd",
        alt: 'A sleek black wireless headphone on a dark background',
    },
    {
        title: 'Chrono Watch',
        price: '$249.99',
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAfZCe6BOvYfbUslEShf-q4hPOPu3V5OANEe4eikL_mEWPYvMJQc460fPM9qG2khjY3qe5Yak1u78y-NzxBgNfoBp49oDLx3qHl9GdlHFJeAvKVGMdGIPibtvLI2SDx0JjiUjjoTLoZ_4hxBO5NFJISsETzDbJXNImOVIje7KtUjXjQjfMXELjXXMZ54mKe9PngJUW6yrLgaRiPQNqmQVhyIOQxGC_ll_6roafRxHN3bpmcMm5kI2-iXDmWdk7yKPAccKnc6wcUrCsK",
        alt: 'A modern smartwatch with a black band and a colorful screen',
    },
    {
        title: 'Retro Camera',
        price: '$149.99',
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAiY_bR2PYdapGOYupA3zGgHuAiTCCIqN_wXa1VRrGzuUXEtjvej3LMVF4W8fNAAp2GCopTw8JeDsSyDvRcjdF8Q3GhzviTyhWq-PceHLA_CgwIHgr3Fj3MDxHknLDwY1n7z7_qsQanmgdyuri9O9VzJSJh3pkZRoefXVJ3qFRRGTiblWD6nz-vh6rQ8rQ_DkwQRjqcxbLHuQFggUUZGjOhpg7MaNfLEipJ46LsBFsepw4YYELg05VuBWOeN4Q1WcwWKP_P6S8lN21o",
        alt: 'A stylish vintage film camera on a wooden surface',
    },
    {
        title: 'Nomad Backpack',
        price: '$299.99',
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBmkEQUydybbNKzs0x7NDxsRIttBkxavpRnahm83_FF-3rQtm5qpdWptU-CfbX6Qru2fCAeq0in1Y18GtIUUcs8NmjuiRuhbkhFAJOoT5wTgoNAg5LINmJPIHPRZjkZ3RJDSEFXDpA9RH4MMno9t2oGplCnDYFNhf5JRm7tNt42DT4LiGV4KR_1wUtGixFMxgBLtdLKsm1kgjPREsmVU-uiVORzNX3RrY9LFD8wS6A-F1IF-6uGlvNK6KlEz1-05iqC1d9kBsiw2LRz",
        alt: 'A minimalist black backpack standing against a plain wall',
    },
    {
        title: 'Velocity Kicks',
        price: '$179.99',
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDS0r6bfelKnRZTlLUgnRGMLIzytuihJNP4j3aZj7l1aMP0w-zooqd2XCGFBuR12Wd8nWosd_WjBHYNx9mieq7jDvtfXyGo73elX-BrG01-cQHWX-3dHaHuZhpersJQPLGi_r4EtKlJ6Bmd8GAapRtYNtF0bFqaXGRLMdzGySxmBCYnWhC51C1zPepJ3ykk1-KXcWClvcQiSA4i6lNo2MzE1d46Qdnjg6PkFVq3BULoFSBrSld3XGmmZX0fcNRjx9v-6XLWS0z-ILBz",
        alt: 'A pair of high-top sneakers in a black and white colorway',
    },
    {
        title: 'SoundWave Speaker',
        price: '$219.99',
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBA24xeEOGHzU5i6R07CDHqkUvhDSwZTnKcvTC-c2ADoThqDuIowgfSZDg5S_erQ6tTvVuNnqEKYCzAcLLgdLSvqb0DfCL5O42h0exCefzmfC9nwoH6x6FhkW9k210eFnMpR_Kgfywpi2zJdzgpQRr-Z2BDqSuranXCLAhsYoiizLzGrj_Y7ewbXx041J4jLohrf41Ul1fnXtpnaZOrvj7pKgG9cAI2fOqZu4U_FedSPxR010vrCWDbdagoSJkZAH-iohlrnb5IBQjV",
        alt: 'A sleek, portable bluetooth speaker in black',
    },
    {
        title: 'Shade Sunglasses',
        price: '$349.99',
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDsyc3iAtT_WOT2hzofi1QxZ_sBzxClicZy53Zms2biNJjbJQDQSGKWBDWRO3pXZOGB4pB2x_EV9Q7wY4kUexdE7iI1kFthRKDXxDESWFMviRE5SSdDpzsqofr69w4jnl739sFO5IgpkyNzpoQfsyTiPZ-oWtdYP9a8bUwmNjgyjWJDzENoYk44NNQqZy806oE4z-JYC37mmfDPQIzXeeh-eHDaTcYxEcrwc5QsYW2sKv4gswoC3pASPwdfyPlreP2PAsfOEH9xE4MS",
        alt: 'A pair of classic black sunglasses resting on a dark surface',
    },
    {
        title: 'Heritage Wallet',
        price: '$99.99',
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuABN2i87LPfOlqiK-I7jl-OcBTudfK1m8XQoY0TZyBcRufofjnYaid7wXNrGC9vxa7t32fGAgFmb3hXZK41YYOiWKe1HLHxSZnzUcOJyqFM9f9nUp4OZa8pKLXhZcd9jfYMTErxWrrAd1Gc5lywM4jq5vFuFR50WAz3P2Ohpv2-XIfUlrKEJHhHNloHP1OM6cXL35BPpQBRYIJJmrqkhhEYOPW0sz7azptrt_51YgnOFUHbiQ7YXwooFI5oFlthRsAAo0eY-yKI4MzT",
        alt: 'A sophisticated leather wallet with credit cards peeking out',
    },
]

const Gallery = () => {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
            {products.map((p) => (
                <GalleryCard key={p.title} title={p.title} price={p.price} image={p.image} alt={p.alt} />
            ))}
        </section>
    )
}

export default Gallery
