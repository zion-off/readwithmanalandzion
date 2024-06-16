// import styling
import styles from "./loader.module.css";

export default function Loader({ style }) {
  return (
    <div style={style}>
      <div className={styles.loader}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
      </div>
    </div>
  );
}
