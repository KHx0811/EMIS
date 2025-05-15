import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavbarHome from '../Components/NavbarHome';
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';
import axios from 'axios';
import './AdminLogin.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const url = import.meta.env.URL;



const AdminLogin = () => {
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    loginType: 'admin',
    username: '',
    password: '',
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

  const handleLogin = async (event) => {
    event.preventDefault();
    const captchaValue = formData.captcha;
    if (validateCaptcha(captchaValue)) {
      try {
        const response = await axios.post(`${url}/api/auth/login`, formData);
        console.log('Login response:', response.data);
        if (response.data && response.data.data) {
          localStorage.setItem('adminToken', response.data.data);
          localStorage.setItem('adminUsername', formData.username);
          toast.success('Admin Login Successful', {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: "toast-success"
          });
          setTimeout(() => {
            navigate('/dashboard/admin');
          }, 1500);
        } else {
          toast.error('Login failed: Invalid response from server', {
            position: "bottom-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: "toast-error"
          });
          console.error('Invalid response structure:', response.data);
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
    const { email, username, password, captcha } = formData;
    if (email && username && password && captcha) {
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
          <h1 className="login-title">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group email-group">
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
              <div className="new-user-signup">
                New User? <Link to="/adminsignup" className="signup-link">Signup</Link>
              </div>
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

export default AdminLogin;