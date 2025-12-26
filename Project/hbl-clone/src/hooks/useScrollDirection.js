import { useState, useEffect } from 'react';

const useScrollDirection = (threshold = 10) => {
    const [scrollDirection, setScrollDirection] = useState('up');
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        let lastScrollY = window.pageYOffset;
        let ticking = false;

        const updateScrollDirection = () => {
            const scrollY = window.pageYOffset;
            const direction = scrollY > lastScrollY ? 'down' : 'up';

            // Only update direction if we've scrolled more than the threshold
            if (Math.abs(scrollY - lastScrollY) >= threshold) {
                setScrollDirection(direction);
                lastScrollY = scrollY > 0 ? scrollY : 0;
            }

            // Track if user has scrolled from top
            setIsScrolled(scrollY > 0);
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollDirection);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll);

        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    return { scrollDirection, isScrolled };
};

export default useScrollDirection;
