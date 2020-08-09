import styles from '../styles/Icon.module.css';

export default function Icon({ name }) {
  return (
    <div className={ styles.icon }>
      { name }
    </div>
  );
};
