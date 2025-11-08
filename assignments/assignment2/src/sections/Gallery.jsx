import { useEffect, useState } from 'react';
import GalleryCard from '../components/GalleryCard';
import axios from 'axios';

const Gallery = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/products`);
            const data = response.data;
            setProducts(data);
            setFilteredProducts(data);

            // Extract unique categories
            const uniqueCategories = ['all', ...new Set(data.map(p => p.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        if (category === 'all') {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.category === category));
        }
    };

    return (
        <section>
            <h2 className="theme-text text-3xl font-bold leading-tight tracking-tight px-4 pb-4 pt-5 text-center md:text-4xl">
                Our Products
            </h2>

            {/* Category Filter */}
            <div className="flex justify-center gap-3 mb-6 flex-wrap">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-4 py-2 cursor-pointer  rounded-lg border border-theme theme-text transition-colors
                            ${selectedCategory === cat
                                ? 'primary'
                                : 'bg-transparent hover:bg-theme hover:text-white'}`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 p-4">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((p, index) => (
                        <GalleryCard
                            key={index}
                            title={p.title}
                            price={p.price}
                            image={p.image}
                            alt={p.alt}
                        />
                    ))
                ) : (
                    <p className="text-center text-muted col-span-full">No products found.</p>
                )}
            </div>
        </section>
    );
};

export default Gallery;
