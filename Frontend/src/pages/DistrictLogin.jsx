import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavbarHome from '../Components/NavbarHome';
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';
import axios from 'axios';
import './AdminLogin.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const url = import.meta.env.VITE_API_URL;


const DistrictLogin = () => {
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    districtId: '',
    captcha: '',
    loginType: 'districthead'
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
        const response = await axios.post(`${url}/api/auth/login`, formData);
        if (response.data.status === 'success') {
          localStorage.setItem('districtToken', response.data.data);
          localStorage.setItem('userType', 'districthead');
          toast.success('District Head Login Successful', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: "toast-success"
          });
          setTimeout(() => {
            navigate('/dashboard/districthead');
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
          console.error('Login failed:', response.data.message);
        }
      } catch (error) {
        console.error('Error during login:', error);
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
    const { email, password, districtId, captcha } = formData;
    if (email && password && districtId && captcha) {
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
          <h1 className="login-title">District Head Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="districtCode">District ID</label>
              <input
                type="text"
                id="districtId"
                name="districtId"
                placeholder="District ID"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">DistrictHead Email</label>
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
              <label htmlFor="password">DistrictHead Password</label>
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

export default DistrictLogin;