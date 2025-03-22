import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AiOutlineHome } from "react-icons/ai";

const NavbarHome = () => {
    const navigate = useNavigate();

    const logostyle = {
        width: "300px",
        height: "100px",
        cursor: "pointer",
    };

    const navbarStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgb(7,3,115)",
        width: "100vw",
        height: "100px",
    };

    const buttonStyle = {
        display: "flex",
        alignItems: "center",
        backgroundColor: "rgb(30, 24, 212)",
        color: "white",
        borderRadius: "20px",
        padding: "10px",
        margin: "10px",
        width: "auto",
        border: "none",
        cursor: "pointer",
        fontSize: "20px",
        transition: "background-color 0.3s ease",
    };

    const buttonHoverStyle = {
        backgroundColor: "rgb(50, 44, 232)",
    };

    const handleLogoClick = () => {
        navigate('/');
    }
    const handleHomeClick = () => {
        navigate('/selectuser');
    };

    return (
        <div style={navbarStyle}>
            <img
                src={assets.Navbar_logo}
                alt="logo"
                style={logostyle}
                onClick={handleLogoClick}
            />
            <button
                style={buttonStyle}
                onClick={handleHomeClick}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor}
            >
                <AiOutlineHome />
            </button>
        </div>
    );
};

export default NavbarHome;