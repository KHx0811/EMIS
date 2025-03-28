import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../../forms/Admin/Student/formStyles';


const ContactAdmin = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('teacherToken');
      const response = await axios.post(
        'http://localhost:3000/api/contact-admin',
        { subject, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResponseMessage(response.data.message);
      setSubject('');
      setMessage('');
    } catch (error) {
      setResponseMessage('Failed to send the request. Please try again.');
      console.error(error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f172a',
        padding: '24px',
        borderRadius: '8px',
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          color: '#f1f5f9',
          marginBottom: '24px',
          borderBottom: '1px solid #475569',
          paddingBottom: '16px',
        }}
      >
        Contact Admin
      </Typography>

      <Box>
        <label style={labelStyle} htmlFor="subject">
          Subject *
        </label>
        <input
          id="subject"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          style={inputStyle}
        />
      </Box>

      <Box>
        <label style={labelStyle} htmlFor="message">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: '#3b82f6',
            color: '#f1f5f9',
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
          }}
        >
          Send
        </Button>
      </Box>

      {responseMessage && (
        <Typography
          variant="body2"
          sx={{
            color: responseMessage.includes('Failed') ? '#f87171' : '#4ade80',
            marginTop: '16px',
            textAlign: 'center',
          }}
        >
          {responseMessage}
        </Typography>
      )}
    </Box>
  );
};

export default ContactAdmin;