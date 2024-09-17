import Link from "next/link";
import "./style.scss";

const Header = () => {
  return (
    <header>
      <Link href="/">Fingers App</Link>
      <Link href="/user-dashboard">Dashboard</Link>
    </header>
  );
};

export default Header;
