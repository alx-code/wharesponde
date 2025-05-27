import React from 'react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          {/* Aquí puedes poner un SVG o un componente de imagen para el logo */}
          <span>Kibot</span>
        </div>
        {/* Navegación (si la hay) */}
        <nav className={styles.nav}>
          {/* Puedes agregar enlaces de navegación aquí */}
          <a href="#features" className={styles.navLink}>Características</a>
          <a href="#pricing" className={styles.navLink}>Precio</a>
          <a href="#contact" className={styles.navLink}>Contacto</a>
        </nav>
        {/* Botón o CTA en el header */}
        <div className={styles.cta}>
          <button className={styles.ctaButton}>Panel Principal</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
