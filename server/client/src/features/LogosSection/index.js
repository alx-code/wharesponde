import React, { useState, useEffect } from 'react';
import styles from './LogosSection.module.css';

const LogosSection = () => {
  const [logos, setLogos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simular llamada a una API para obtener logos
    const fetchLogos = async () => {
      try {
        setIsLoading(true);
        // En un caso real, aquí harías una petición fetch o axios a tu backend
        // Ejemplo: const response = await fetch('/api/public/logos');
        // const data = await response.json();
        
        // Datos de ejemplo (los mismos que teníamos)
        const exampleLogos = [
          { id: 1, name: 'Kibot', src: '/logos/kibot.png' },
          { id: 2, name: 'Kexe', src: '/logos/kexe.png' },
          { id: 3, name: 'Kuvo', src: '/logos/kuvo.png' },
          // Añade más logos según sea necesario
        ];

        // Simular un delay de red
        setTimeout(() => {
          setLogos(exampleLogos);
          setIsLoading(false);
        }, 1000);

      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    fetchLogos();
  }, []); // El array vacío asegura que esto se ejecute solo una vez al montar

  if (isLoading) {
    return <section className={styles.logosSection}><div className={styles.container}><p>Cargando logos...</p></div></section>;
  }

  if (error) {
    return <section className={styles.logosSection}><div className={styles.container}><p>Error al cargar logos: {error.message}</p></div></section>;
  }

  return (
    <section className={styles.logosSection}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Verificado por las marcas más dinámicas en mercados emergentes</h2>
        <div className={styles.logosGrid}>
          {logos.map(logo => (
            <div key={logo.id} className={styles.logoItem}>
              {/* Si usas imágenes */}
              {/* Asegúrate de que la ruta src sea correcta, ej: /logos/kibot.png si están en client/public */}
              {/* <img src={logo.src} alt={logo.name} className={styles.logoImage} /> */}
              {/* O si usas texto (como en la imagen original) */}
              <span className={styles.logoText}>&lt;{logo.name}&gt;</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogosSection;
