import { useState, useEffect } from 'react';

const useCarousel = (carouselData, autoSlideInterval = 5000) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [animationKey, setAnimationKey] = useState(0);

    // Auto-slide functionality - always enabled
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => {
                const nextSlide = (prev + 1) % carouselData.length;
                setAnimationKey(prev => prev + 1);
                return nextSlide;
            });
        }, autoSlideInterval);

        return () => clearInterval(interval);
    }, [carouselData.length, autoSlideInterval]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
        setAnimationKey(prev => prev + 1);
    };

    const goToPrevious = () => {
        setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
        setAnimationKey(prev => prev + 1);
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselData.length);
        setAnimationKey(prev => prev + 1);
    };

    return {
        currentSlide,
        animationKey,
        currentContent: carouselData[currentSlide],
        goToSlide,
        goToPrevious,
        goToNext,
        totalSlides: carouselData.length
    };
};

export default useCarousel;
