import React, { useState} from "react";
import "./Navbar.css";

import logo from '../../assets/images/book.png';

const Navbar = ({profile}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="logo">
          <img src={logo} alt="Darsni Logo" /> Darisni
        </a>

        
        <div className="menu-icon" onClick={toggleMenu}>
        {!isMenuOpen ?
        <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Menu / Menu_Alt_01"> <path id="Vector" d="M12 17H19M5 12H19M5 7H19" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>
         : <div>
          <svg fill="#000000" width="40px" height="40px" viewBox="0 0 200 200" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title></title><path d="M114,100l49-49a9.9,9.9,0,0,0-14-14L100,86,51,37A9.9,9.9,0,0,0,37,51l49,49L37,149a9.9,9.9,0,0,0,14,14l49-49,49,49a9.9,9.9,0,0,0,14-14Z"></path></g></svg>
         </div> }
            </div>

        <ul className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <li>
            <a href="/" className="nav-link" onClick={toggleMenu}>
              Home
            </a>
          </li>
          {profile.name ? 
          <>
             <li>
             {!profile.name ? 
             <a href="/login" className="nav-link" onClick={toggleMenu}>
             My Courses
           </a>
             : <a href="/mycourses" className="nav-link" onClick={toggleMenu}>
             My Courses
           </a>
            }
            </li>
            </>
           : <>
           </>   }
          <li>
            <a href="/majorcheck" className="nav-link" onClick={toggleMenu}>
              Major Fit
            </a>
          </li>
          <li>
            <a href="#about" className="nav-link" onClick={toggleMenu}>
              About
            </a>
          </li>
          <li>
            <a href="mailto:darsni.support@gmail.com" className="nav-link" onClick={toggleMenu}>
              Contact
            </a>
          </li>
          
          {profile.name ? 
         <a href="/profile" className="cta-button-mobile">
         Welcome! {profile.name}
       </a>
         :  <a href="/signup" className="cta-button-mobile">
         Sign Up
       </a>}
        </ul>
         {profile.name ? 
         <a href="/profile" className="cta-button-desktop">
         Welcome! {profile.name}
       </a>
         :  <a href="/signup" className="cta-button-desktop">
         Sign Up
       </a>}
        
      </div>
    </nav>
  );
};

export default Navbar;