import React, { useState } from 'react';
import NavbarHome from '../Components/NavbarHome';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const styles = {
  loginContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Transparent background
  },
  formBackground: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: "url('../assets/login-image.png')", // Replace with your background image path
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
  },
  loginFormContainer: {
    width: '100%',
    maxWidth: '450px',
    padding: '30px 40px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent background
    border: '1px solid #ccc',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  loginTitle: {
    fontSize: '28px',
    marginBottom: '20px',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  formGroup: {
    marginBottom: '20px',
    position: 'relative',
  },
  formGroupLabel: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
  },
  formGroupInput: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '0',
    boxSizing: 'border-box',
  },
  formButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '40px',
  },
  loginButton: {
    backgroundColor: '#1a347a',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    padding: '10px 35px',
    fontSize: '18px',
    cursor: 'pointer',
    margin: '0 5px',
  },
  loginButtonHover: {
    backgroundColor: '#14275e',
  },
  backButton: {
    backgroundColor: '#1a347a',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    padding: '10px 35px',
    fontSize: '18px',
    cursor: 'pointer',
    margin: '0 5px',
  },
  backButtonHover: {
    backgroundColor: '#14275e',
  },
};

const SendResetOtp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleLoginClick = async (event) => {
    event.preventDefault();
    if (!email) {
      alert("Please enter email");
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/send-reset-otp', { email });
      console.log('OTP sent successfully:', response.data);
      alert("OTP sent successfully to registered email");
      navigate('/resetpassword');
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
    }
  };

  return (
    <div style={styles.loginContainer}>
      <NavbarHome />
      <div style={styles.formBackground}>
        <div style={styles.loginFormContainer}>
          <h1 style={styles.loginTitle}>Send Reset OTP</h1>
          <form>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.formGroupLabel}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email..."
                style={styles.formGroupInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div style={styles.formButtons}>
              <button type="button" style={styles.backButton} onClick={() => navigate(-1)}>Back</button>
              <button type="submit" style={styles.loginButton} onClick={handleLoginClick}>Send OTP</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendResetOtp;