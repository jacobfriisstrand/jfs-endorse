import { Logo, Text, LogoWithText } from "@/logo/Logo";
import styles from "./Preloader.module.css";

export default function Preloader() {
  return (
    <div className={styles.preloader__container}>
      <Logo />
      <Text />
      <LogoWithText />
    </div>
  );
}
