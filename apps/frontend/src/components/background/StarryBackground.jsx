import { useEffect, useState } from 'react';
import './StarryBackground.css';

export default function StarryBackground() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generar 200 estrellas aleatorias con diferentes tamaños y tiempos de animación
    const generatedStars = Array.from({ length: 200 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 0.5, // 0.5px a 2.5px
      duration: Math.random() * 3 + 2, // 2s a 5s
      delay: Math.random() * 5, // 0s a 5s
      opacity: Math.random() * 0.7 + 0.3, // 0.3 a 1
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="starry-background">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            '--duration': `${star.duration}s`,
            '--delay': `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
