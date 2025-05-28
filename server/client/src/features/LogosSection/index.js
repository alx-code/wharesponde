import React, { useState, useEffect } from 'react';
import styles from './LogosSection.module.css';
// Puedes importar un icono de placeholder si tienes uno, por ejemplo:
// import EmptyImageIcon from '../../components/Icons/EmptyImageIcon';

const LogosSection = () => {
  const [logosData, setLogosData] = useState([]); // Datos crudos de la API
  const [loadedLogos, setLoadedLogos] = useState({}); // Almacena las imágenes cargadas o estado de error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadErrors, setImageLoadErrors] = useState({}); // Para rastrear errores de carga de imágenes

  useEffect(() => {
    // Realizar llamada a la API para obtener logos desde el backend
    const fetchLogos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/get_brands');
        const result = await response.json();

        if (result.success) {
          setLogosData(result.data);
          setError(null);
        } else {
          setError(new Error(result.msg || 'Error fetching logos'));
          setLogosData([]);
        }
      } catch (err) {
        console.error('Error fetching logos:', err);
        setError(err);
        setLogosData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogos();
  }, []); // Se ejecuta solo una vez al montar para obtener los datos de la API

  useEffect(() => {
    // Intentar cargar cada imagen una vez que los datos de los logos estén disponibles
    const loadImages = () => {
      const errors = {};
      const loaded = {};
      logosData.forEach(logo => {
        try {
          // Intentar requerir la imagen dinámicamente
          // La ruta relativa a client/src/media desde este archivo es ../../media
          loaded[logo.id] = require(`../../media/${logo.filename}`).default;
        } catch (err) {
          // Si falla el require (archivo no encontrado por Webpack)
          console.warn(`Could not load image for logo ID ${logo.id}: ${logo.filename}`, err.message);
          errors[logo.id] = true; // Marcar este logo con error
        }
      });
      setLoadedLogos(loaded);
      setImageLoadErrors(errors);
    };

    if (logosData.length > 0) {
      loadImages();
    } else if (!isLoading && !error) {
      // Si no hay datos y no está cargando ni hay error de API, puede que no haya logos
      setLoadedLogos({});
      setImageLoadErrors({});
    }

  }, [logosData, isLoading, error]); // Se ejecuta cuando logosData, isLoading o error cambian

  if (isLoading) {
    return <section className={styles.logosSection}><div className={styles.container}><p>Cargando logos...</p></div></section>;
  }

  if (error) {
    return <section className={styles.logosSection}><div className={styles.container}><p>Error al cargar logos: {error.message}</p></div></section>;
  }

  // Si no hay datos de logos después de cargar (ni errores), no renderizar la sección
  if (logosData.length === 0 && Object.keys(loadedLogos).length === 0 && Object.keys(imageLoadErrors).length === 0) {
     return null;
  }

  return (
    <section className={styles.logosSection}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Verificado por las marcas más dinámicas en mercados emergentes</h2>
        <div className={styles.logosGrid}>
          {logosData.map(logo => (
            <div key={logo.id} className={styles.logoItem}>
              {/* Mostrar la imagen si se cargó correctamente, de lo contrario mostrar un placeholder */}
              {loadedLogos[logo.id] ? (
                <img 
                  src={loadedLogos[logo.id]} 
                  alt={`Logo ${logo.id}`}
                  className={styles.logoImage}
                  // No necesitamos onError aquí ya que manejamos el error de require
                />
              ) : (
                // Placeholder o icono de vacío si la imagen no se pudo cargar
                <div className={styles.logoPlaceholder}> {/* Usar un div para el placeholder */}
                   {/* Puedes poner un icono SVG o texto aquí */}
                   {/* <EmptyImageIcon /> */}
                   Imagen no disponible
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogosSection;
