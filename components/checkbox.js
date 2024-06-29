// import styling
import styles from "./checkbox.module.css";

export default function Checkbox({ label, value, onChange }) {
  return (
    <label className={styles.container}>
      <input type="checkbox" checked={value} onChange={onChange} />
      <span className={styles.checkmark}></span>
      <div className={`archivo ${styles.label}`}>{label}</div>
    </label>
  );
}
