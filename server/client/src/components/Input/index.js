import React from 'react';
import styles from './Input.module.css';

const Input = ({ label, placeholder, value, onChange, isTextArea }) => {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      {isTextArea ? (
        <textarea
          className={styles.inputField}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          type="text"
          className={styles.inputField}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
};

export default Input;
