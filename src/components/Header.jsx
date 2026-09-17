import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import logo from "../img/roc-nijmegen-logo-2024.jpg";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Menu sluiten bij klikken buiten het menu
  useEffect(() => {
    if (!menuOpen) return;
    const sluit = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", sluit);
    return () => document.removeEventListener("mousedown", sluit);
  }, [menuOpen]);

  const ga = (pad) => {
    setMenuOpen(false);
    navigate(pad);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <header className="site-header">
      <img src={logo} alt="ROC Nijmegen" className="site-header__logo" />

      {user && (
        <div className="mijn-roc" ref={menuRef}>
          <button
            type="button"
            className="pill"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            Mijn ROC
          </button>

          {menuOpen && (
            <div className="mijn-roc__menu">
              <span className="mijn-roc__email">{user.email}</span>
              <button type="button" className="mijn-roc__item" onClick={() => ga("/game")}>
                Oefenen
              </button>
              {user.claims?.admin && (
                <>
                  <button type="button" className="mijn-roc__item" onClick={() => ga("/admin")}>
                    Admin
                  </button>
                  <button type="button" className="mijn-roc__item" onClick={() => ga("/admin/woorden")}>
                    Woorden beheren
                  </button>
                </>
              )}
              <button type="button" className="mijn-roc__item" onClick={handleLogout}>
                Uitloggen
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
