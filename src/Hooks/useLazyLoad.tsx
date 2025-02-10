import { useEffect, useState } from 'react';

function useLazyLoad() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true); 
        } else {
          setIsVisible(false); 
        }
      },
      {
        threshold: 0.1,
      }
    );

    const element = document.getElementById('lazy-load-card');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return isVisible;
}

export default useLazyLoad;
