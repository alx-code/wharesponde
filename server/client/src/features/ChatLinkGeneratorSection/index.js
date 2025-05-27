import React, { useState } from 'react';
import styles from './ChatLinkGeneratorSection.module.css';
import Input from '../../components/Input';
import Button from '../../components/Button';

const ChatLinkGeneratorSection = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  const handleGenerateLink = () => {
    // Lógica para generar el link (interacción con el backend)
    console.log('Generar link con:', { phoneNumber, name, welcomeMessage });
    // Aquí llamarías a la API usando fetch o axios
    // Por ahora, solo mostramos los valores en consola
  };

  return (
    <section className={styles.chatLinkGeneratorSection}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2>Crear links de chat de WhatsApp</h2>
          <p>Por favor proporcione su número de teléfono incluyendo el código de país, pero sin el símbolo '+'.</p>
          <div className={styles.form}>
            <Input
              label="Número de Teléfono"
              placeholder="Ej: 521234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Input
              label="Tu Nombre (Opcional)"
              placeholder="Ej: John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Mensaje de Bienvenida (Opcional)"
              placeholder="Ej: Hola, tengo una pregunta sobre tus productos."
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              isTextArea
            />
            <Button onClick={handleGenerateLink}>Generar Link</Button>
          </div>
        </div>
        {/* Imagen decorativa */}
        <div className={styles.imageContainer}>
          {/* Placeholder for now */}
          <div className={styles.imagePlaceholder}></div>
        </div>
      </div>
    </section>
  );
};

export default ChatLinkGeneratorSection;
