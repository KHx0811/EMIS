import React, { useState } from 'react';
import NavbarHome from '../Components/NavbarHome';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';

const url = import.meta.env.VITE_API_URL;


const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !otp || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(`${url}/api/auth/reset-password`, {
        email,
        otp,
        newPassword: password
      });
      console.log('Password reset successful:', response.data);
      alert("Password Reset Successfully");
      navigate('/selectuser');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <NavbarHome />
      <div className="form-background">
        <div className="login-form-container">
          <h1 className="login-title">Reset Password</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-group-label" htmlFor="email">Email</label>
              <input
                className="form-group-input"
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="form-group-label" htmlFor="OTP">Reset OTP</label>
              <input
                className="form-group-input"
                type="text"
                id="OTP"
                name="OTP"
                placeholder="xxxxxx"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <label className="form-group-label" htmlFor="password">New Password</label>
              <input
                className="form-group-input"
                type="password"
                id="password"
                name="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="form-group-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                className="form-group-input"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="button-container">
              <button className="login-button" type="submit">Reset Password</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;