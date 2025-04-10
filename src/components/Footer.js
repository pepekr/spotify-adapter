import React from "react";
import Link from "next/link";
import "../styles/footer.css";
function Footer() {
  return (
    <footer className="footer">
      <Link href="/">Share this site</Link>
      <Link href="/">Help</Link>
      <p>Playlists created:</p>
    </footer>
  );
}

export default Footer;
