import React, { useState } from 'react';
import { Box, TextField, IconButton, Button, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const url = import.meta.env.VITE_API_URL;

const DeleteParent = () => {
  const navigate = useNavigate();
  const [parentId, setParentId] = useState('');
  const [parentData, setParentData] = useState(null);

  const fetchParentById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return null;
      }
      const response = await axios.get(`${url}/api/parents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = response.data.data;
      data.date_of_birth = new Date(data.date_of_birth).toLocaleDateString('en-GB');
      return data;
    } catch (error) {
      console.error('Error fetching parent data:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error fetching parent data. Please try again.');
      }
      return null;
    }
  };

  const deleteParent = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return;
      }
      await axios.delete(`${url}/api/parents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Parent deleted successfully');
      alert('Parent deleted successfully');
      setParentData(null);
    } catch (error) {
      console.error('Error deleting parent:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error deleting parent. Please try again.');
      }
    }
  };

  const handleSearch = async () => {
    const data = await fetchParentById(parentId);
    if (data) {
      setParentData(data);
    } else {
      setParentData(null);
    }
  };

  const handleDelete = () => {
    deleteParent(parentId);
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
        Delete Parent Profile
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label="Parent ID"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          onKeyPress={handleKeyPress}
          required
          halfWidth
          size='Small'
          variant='filled'
          sx={{textDecoration: 'none', borderColor: 'none'}}
        />
        <IconButton 
          onClick={handleSearch}
          sx={{ 
            color: '#f1f5f9',
            backgroundColor: '#3b82f6',
            borderRadius: '50px',
            padding: '12px',
            marginLeft: '8px',
            '&:hover': {
              backgroundColor: '#2563eb',
            }
          }}
        >
          <SearchIcon />
        </IconButton>
      </Box>

      {parentData && (
        <Box sx={{ mt: 2, height:'100vh', color: '#f1f5f9' }}>
          <Typography>Parent ID: {parentData.parent_id}</Typography>
        <Typography>Student ID: {parentData.student_id}</Typography>
        <Typography>Name: {parentData.name}</Typography>
        <Typography>Relation: {parentData.relation}</Typography>
        <Typography>Contact: {parentData.phonenumber}</Typography>
        <Typography>Email: {parentData.email}</Typography>
        <Typography>Qualification: {parentData.qualification}</Typography>
        <Typography>Age: {parentData.age}</Typography>
        <Typography>Date Of Birth: {parentData.date_of_birth}</Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleDelete}
            sx={{ 
              backgroundColor: '#3b82f6',
              color: '#f1f5f9',
              padding: '8px 16px',
              marginTop: '16px',
              '&:hover': {
                backgroundColor: '#2563eb',
              }
            }}
          >
            Delete Parent
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DeleteParent;