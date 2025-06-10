import React, { useEffect, useState } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import { Home, Flame, Briefcase, LogIn, Shield } from 'lucide-react';
import logo from '../assets/primelogo.png';
import { useAuth } from '../hooks/useAuth'; // Importar useAuth

export default function Navbar() {
  const { isAuthenticated, isAdmin } = useAuth(); // Usar o hook useAuth

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo-container">
          <img src={logo} alt="Prime Fit Logo" className="logo-img" />
          <h1 className="logo-text">PRIME FIT CONSULTING</h1>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/">
              <Home size={18} style={{ marginRight: '5px' }} />
              Início
            </Link>
          </li>
          <li>
            <Link to="/emagrecedores">
              <Flame size={18} style={{ marginRight: '5px' }} />
              Emagrecedores
            </Link>
          </li>
          <li>
            <Link to="/consultoria">
              <Briefcase size={18} style={{ marginRight: '5px' }} />
              Consultoria
            </Link>
          </li>
          {!isAuthenticated ? (
            <li>
              <Link to="/cliente">
                <LogIn size={18} style={{ marginRight: '5px' }} />
                Login
              </Link>
            </li>
          ) : (
            <li>
              <Link to="/dashboard">
                <LogIn size={18} style={{ marginRight: '5px' }} />
                Dashboard
              </Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link to="/admin">
                <Shield size={18} style={{ marginRight: '5px' }} />
                Painel Admin
              </Link>
            </li>
          )}
        </ul>
      </div>

      <style>
        {`
          .logo-text {
            font-size: 2rem;
            font-weight: bold;
            color: #00ff95;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            white-space: nowrap;
          }
          .logo-img {
            height: 50px;
          }
          .logo-container {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .navbar {
            background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
            padding: 1rem 2rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          .navbar-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .nav-links {
            display: flex;
            gap: 1.5rem;
            margin-left: auto;
            font-weight: 500;
          }
          .nav-links a {
            color: #fff;
            text-decoration: none;
            transition: color 0.3s;
            display: flex;
            align-items: center;
          }
          .nav-links a:hover {
            color: #00ff95;
          }
        `}
      </style>
    </nav>
  );
}


