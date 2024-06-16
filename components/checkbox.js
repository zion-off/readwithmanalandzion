// import styling
import styles from "./checkbox.module.css";
import { Archivo } from "@/assets/fonts/fonts";

export default function Checkbox({ label, value, onChange }) {
  return (
    <label className={styles.container}>
      <input type="checkbox" checked={value} onChange={onChange} />
      <span className={styles.checkmark}></span>
      <div className={`${Archivo.className} ${styles.label}`}>{label}</div>
    </label>
  );
}
