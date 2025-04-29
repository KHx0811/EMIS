import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavbarHome from '../Components/NavbarHome';
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';
import axios from 'axios';
import './AdminLogin.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const PrincipalLogin = () => {
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    schoolId: '',
    email: '',
    password: '',
    captcha: '',
    loginType: 'school'
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

  const handleLogin = async (event) => {
    event.preventDefault();
    const captchaValue = formData.captcha;
    if (validateCaptcha(captchaValue)) {
      try {
        const response = await axios.post('http://localhost:3000/api/auth/login', formData);
        if(response.data.status === 'success') {
          localStorage.setItem('principalToken', response.data.data);
          localStorage.setItem('userType', 'principal');
          alert('Principal Login Successful');
          navigate('/dashboard/principal');
        }else {
          console.error('Login failed:', response.data.message);
          alert('Login failed. Please try again.');
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed. Please try again.');
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
    const { schoolId, email, password, captcha } = formData;
    if (schoolId && email && password && captcha) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };

  return (
    <div className="login-container">
      <NavbarHome />
      <div className="form-background">
        <div className="login-form-container">
          <h1 className="login-title">Principal Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="schoolId">School ID</label>
              <input
                type="text"
                id="schoolId"
                name="schoolId"
                placeholder="School ID"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
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
            <div className="form-group captcha-group">
              <input
                type='text'
                id='captcha'
                name='captcha'
                placeholder='Enter Captcha'
                required
                className="captcha-input"
                onChange={handleChange}
              />
              <div className="captcha-container">
                <LoadCanvasTemplateNoReload />
                <i className="fas fa-sync-alt reload-captcha" onClick={reloadCaptcha}></i>
              </div>
            </div>
            <div style={{display:'flex', justifyContent:'center'}}>
              <button
                type="submit"
                className={`login-button ${isFormValid ? 'active' : 'inactive'}`}
                disabled={!isFormValid}
              >
                Login
              </button>
            </div>
            <div className='forgot-password-container'>
              <div className="forgot-password">
                <Link to="/getresetpasswordotp">Forgot Password?</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrincipalLogin;