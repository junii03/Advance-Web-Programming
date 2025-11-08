import { useEffect, useState } from 'react'
import GalleryCard from '../components/GalleryCard'
import axios from "axios";


const Gallery = () => {
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/products`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {


        fetchProducts();
    }, []);


    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
            {products.map((p, index) => (
                <GalleryCard key={index} title={p.title} price={p.price} image={p.image}
                    category={p.category} description={p.description} alt={p.alt} />
            ))}
        </section>
    )
}

export default Gallery
