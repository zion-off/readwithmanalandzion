// import styling
import styles from "./loader.module.css";

export default function Loader({ containerStyle, circleStyle }) {
  return (
    <div>
      <div className={styles.loader} style={containerStyle}>
        <div className={styles.circle} style={circleStyle}></div>
        <div className={styles.circle} style={circleStyle}></div>
      </div>
    </div>
  );
}
