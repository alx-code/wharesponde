import React from 'react';
import styles from './HeroSection.module.css';
// Importa la imagen relevante, asegúrate de tenerla en client/public o client/src/assets
// import heroImage from '../../assets/hero-image.png'; 

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1>Haz crecer tu negocio con Kibot</h1>
          <p>
            Personaliza la comunicación y vende más con la plataforma de WhatsApp
            Business API que automatiza el marketing, ventas, servicio y soporte.
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.primaryButton}>Pruébalo ahora</button>
            <button className={styles.secondaryButton}>Agenda una Demo Hoy &gt;</button>
          </div>
        </div>
        <div className={styles.imageContainer}>
          {/* Aquí iría la imagen */}
          {/* <img src={heroImage} alt="Kibot Interface" className={styles.heroImage} /> */}
          {/* Placeholder for now */}
          <div className={styles.imagePlaceholder}></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
