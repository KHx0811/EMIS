import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const SessionTimer = ({ tokenKey }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const token = localStorage.getItem(tokenKey);
      if (!token) return 0;
      
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) return 0;
        
        const payload = JSON.parse(atob(tokenParts[1]));
        if (!payload.exp) return 0;
        
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = Math.max(0, payload.exp - currentTime);
        
        setIsWarning(timeLeft < 300);
        
        return timeLeft;
      } catch (error) {
        console.error('Error calculating time remaining:', error);
        return 0;
      }
    };

    setTimeRemaining(calculateTimeRemaining());
    
    const intervalId = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        window.location.reload();
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [tokenKey]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: isWarning 
          ? 'rgba(255, 87, 34, 0.1)' 
          : 'rgba(0, 222, 182, 0.1)',
        borderRadius: '4px',
        padding: '4px 12px',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 'bold',
          color: isWarning ? '#FF5722' : '#00deb6',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span style={{ marginRight: '6px' }}>⏱️</span>
        Session expires in: {formattedTime}
      </Typography>
    </Box>
  );
};

export default SessionTimer;