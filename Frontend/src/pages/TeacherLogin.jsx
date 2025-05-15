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


const TeacherLogin = () => {
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: '',
    email: '',
    password: '',
    captcha: '',
    loginType: 'teacher'
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
          localStorage.setItem('teacherToken', response.data.data);
          localStorage.setItem('userType', 'teacher');
          toast.success('Teacher Login Successful', {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            className: "toast-success"
          });
          setTimeout(() => {
            navigate('/dashboard/teacher');
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
    const { teacherId, email, password, captcha } = formData;
    if (teacherId && email && password && captcha) {
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
          <h1 className="login-title">Teacher Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="schoolId">Teacher ID</label>
              <input
                type="text"
                id="teacherId"
                name="teacherId"
                placeholder="Teacher ID"
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
                placeholder="Email..."
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

export default TeacherLogin;