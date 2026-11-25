import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Heart, Menu, Moon, Sun, X } from 'lucide-react'
import SearchBox from './SearchBox.jsx'
import { useApp } from '../lib/AppContext.jsx'

function Brand() {
  return <Link to="/" className="brand" aria-label="Toolora home"><span className="brand-mark">T</span><span>toolora<span className="brand-dot">.</span></span></Link>
}

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useApp()
  const closeMenu = () => setMenuOpen(false)
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            <NavLink to="/" onClick={closeMenu}>Home</NavLink>
            <a href="/#tools" onClick={closeMenu}>Tools</a>
            <a href="/#categories" onClick={closeMenu}>Categories</a>
            <a href="/#popular" onClick={closeMenu}>Popular</a>
            <Link to="/favorites" onClick={closeMenu}><Heart size={16} /> Favorites</Link>
            <div className="mobile-search"><SearchBox compact onPick={closeMenu} /></div>
          </nav>
          <div className="header-actions">
            <div className="desktop-search"><SearchBox compact /></div>
            <button className="icon-button theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title="Toggle color theme">
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button className="icon-button menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-about"><Brand /><p>Helpful online tools that make everyday calculations and tasks a little simpler.</p></div>
            <div className="footer-links"><h2>Explore</h2><Link to="/#tools">All tools</Link><Link to="/#categories">Categories</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></div>
            <div className="footer-links"><h2>Information</h2><Link to="/privacy-policy">Privacy policy</Link><Link to="/terms">Terms</Link><Link to="/disclaimer">Disclaimer</Link></div>
            <div className="footer-links"><h2>Contact</h2><a href="mailto:mritik351@gmail.com">mritik351@gmail.com</a><a href="tel:98932551151">98932551151</a><span>Bhopal, Madhya Pradesh, India</span></div>
          </div>
          <div className="footer-bottom"><span>© {new Date().getFullYear()} Toolora. All rights reserved.</span><span>Free tools, clear answers.</span></div>
        </div>
      </footer>
    </>
  )
}
