import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarHome from '@/Components/NavbarHome';
import { LoadCanvasTemplateNoReload, loadCaptchaEnginge, validateCaptcha } from 'react-simple-captcha';
import axios from 'axios';
import './AdminSignup.css';
import config from '@/assets/config';

const { url } = config;

const AdminSignup = () => {
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    retypedPassword: '',
    captcha: ''
  });

  useEffect(() => {
    loadCaptchaEnginge(5);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    checkFormValidity();
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    const captchaValue = formData.captcha;
    if (validateCaptcha(captchaValue)) {
      try {
        const response = await axios.post(`${url}/api/auth/signup`, formData);
        console.log('Signup successful:', response.data);
        alert('Admin Signup Successful');
        navigate('/login/admin');
      } catch (error) {
        console.error('Error during signup:', error);
        alert('Signup failed. Please try again.');
      }
    } else {
      alert('Invalid Captcha, please try again.');
      loadCaptchaEnginge(5);
    }
  };

  const reloadCaptcha = () => {
    loadCaptchaEnginge(5);
  };

  const checkFormValidity = () => {
    const { email, username, password, retypedPassword, captcha } = formData;
    if (email && username && password && retypedPassword && captcha) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };

  return (
    <div className="signup-container">
      <NavbarHome />
      <div className="form-background">
        <div className="signup-form-container">
          <h1 className="signup-title">Admin Signup</h1>
          <form onSubmit={handleSignup}>
            <div className="form-group email-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email..."
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-group username-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Username"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-group retyped-password-group">
              <label htmlFor="retypedPassword">Re-enter Password</label>
              <input
                type="password"
                id="retypedPassword"
                name="retypedPassword"
                placeholder="Re-enter Password"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-group captcha-group">
              <input
                type="text"
                id="captcha"
                name="captcha"
                placeholder="Enter Captcha"
                required
                className="captcha-input"
                onChange={handleChange}
              />
              <div className="captcha-container">
                <LoadCanvasTemplateNoReload />
                <i className="fas fa-sync-alt reload-captcha" onClick={reloadCaptcha}></i>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="submit"
                className={`signup-button ${isFormValid ? 'active' : 'inactive'}`}
                disabled={!isFormValid}
              >
                Signup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;