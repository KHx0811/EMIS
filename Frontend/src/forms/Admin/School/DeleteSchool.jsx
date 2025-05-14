import React, { useState } from 'react';
import { Box, IconButton, Button, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle } from '../Student/formStyles';
import config from '@/assets/config';

const { url } = config;

const DeleteSchool = () => {
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState('');
  const [schoolData, setSchoolData] = useState(null);
  const [error, setError] = useState('');

  const fetchSchoolById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return null;
      }
      const response = await axios.get(`${url}/api/schools/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = response.data.data;
      if (data.date_of_establishment) {
        data.date_of_establishment = new Date(data.date_of_establishment).toLocaleDateString('en-GB');
      }
      return data;
    } catch (error) {
      console.error('Error fetching school data:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else if (error.response) {
        setError(`Error: ${error.response.data?.message || 'Failed to fetch school data'}`);
      } else {
        setError('Error fetching school data. Please try again.');
      }
      return null;
    }
  };

  const deleteSchool = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return;
      }
      await axios.delete(`${url}/api/schools/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('School deleted successfully');
      alert('School deleted successfully');
      setSchoolData(null);
      setSchoolId('');
    } catch (error) {
      console.error('Error deleting school:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error deleting school. Please try again.');
      }
    }
  };

  const handleSearch = async () => {
    if (!schoolId.trim()) {
      setError('Please enter a School ID');
      return;
    }
    
    setError('');
    const data = await fetchSchoolById(schoolId);
    if (data) {
      setSchoolData(data);
    } else {
      setSchoolData(null);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
      deleteSchool(schoolId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#0f172a',
        padding: '24px',
        borderRadius: '8px'
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
          paddingBottom: '16px'
        }}
      >
        Delete School Profile
      </Typography>
      
      <Box sx={{ marginBottom: '24px' }}>
        <label style={labelStyle} htmlFor="school_id_search">School ID *</label>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <input
            id="school_id_search"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            onKeyPress={handleKeyPress}
            required
            style={{
              ...inputStyle,
              marginBottom: 0,
              flexGrow: 1
            }}
            placeholder="Enter School ID"
          />
          <IconButton 
            onClick={handleSearch}
            sx={{ 
              color: '#f1f5f9',
              backgroundColor: '#3b82f6',
              borderRadius: '6px',
              padding: '8px',
              '&:hover': {
                backgroundColor: '#2563eb',
              }
            }}
          >
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Box sx={{ 
          backgroundColor: '#b91c1c20', 
          color: '#ef4444', 
          padding: '12px', 
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          {error}
        </Box>
      )}

      {schoolData && (
        <Box sx={{ mt: 2, color: '#f1f5f9' }}>
          <Typography variant="h6">School Details</Typography>
          <Typography>School Name: {schoolData.school_name}</Typography>
          <Typography>School ID: {schoolData.school_id}</Typography>
          <Typography>District ID: {schoolData.district_id}</Typography>
          <Typography>Principal Name: {schoolData.principal_name}</Typography>
          <Typography>Date of Establishment: {schoolData.date_of_establishment}</Typography>
          <Typography>Email: {schoolData.email}</Typography>
          
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleDelete}
            sx={{ 
              backgroundColor: '#ef4444', 
              color: '#f1f5f9', 
              padding: '8px 16px',
              marginTop: '16px',
              '&:hover': {
                backgroundColor: '#dc2626', 
              }
            }}
          >
            Delete School
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DeleteSchool;