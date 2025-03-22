import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { GoArrowRight } from "react-icons/go";

const Navbar = () => {
    const navigate = useNavigate();

    const logostyle = {
        width: "300px",
        height: "100px",
        cursor: "pointer", // Add cursor pointer to indicate it's clickable
    };

    const navbarStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgb(7,3,115)",
        width: "100%",
        height: "100px",
        margin: "0"
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

    const handleLoginClick = () => {
        navigate('/SelectUser');
    };

    const handleLogoClick = () => {
        navigate('/');
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
                onClick={handleLoginClick}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor}
            >
                Login <GoArrowRight />
            </button>
        </div>
    );
};

export default Navbar;