import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavbarHome from '../Components/NavbarHome';
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';
import axios from 'axios';
import './AdminLogin.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ParentLogin = () => {
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    dateOfBirth: '',
    captcha: '',
    loginType: 'parent'
  });

  useEffect(() => {
    loadCaptchaEnginge(5);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'dateOfBirth') {
      formattedValue = value.replace(/\D/g, ''); // Remove non-numeric characters
    }
    setFormData({
      ...formData,
      [name]: formattedValue
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
          localStorage.setItem('parentToken', response.data.data);
          localStorage.setItem('userType', 'parent');
          toast.success('Parent Login Successful', {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: "toast-success"
          });
          setTimeout(() => {
            navigate('/dashboard/parent');
          }, 1500);
        } else {
          toast.error('Login failed. Please try again.', {
            position: "bottom-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: "toast-error"
          });
        }
      } catch (error) {
        toast.error(`Login failed: ${error.response?.data?.message || 'Please try again.'}`, {
          position: "bottom-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: "toast-error"
        });
      }
    } else {
      toast.error('Invalid Captcha, please try again.', {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "toast-error"
      });
      loadCaptchaEnginge(5);
    }
  };

  const reloadCaptcha = () => {
    loadCaptchaEnginge(5);
  };

  const checkFormValidity = () => {
    const { email, dateOfBirth, captcha } = formData;
    if (email && dateOfBirth && captcha) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  };

  return (
    <div className="login-container">
      <NavbarHome />
      <ToastContainer />
      <div className="form-background">
        <div className="login-form-container">
          <h1 className="login-title">Parent Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
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
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="text"
                id="dateOfBirth"
                name="dateOfBirth"
                placeholder="DDMMYYYY"
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

export default ParentLogin;