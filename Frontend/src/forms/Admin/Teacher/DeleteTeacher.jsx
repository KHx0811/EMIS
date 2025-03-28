import React, { useState } from 'react';
import { Box, TextField, IconButton, Button, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DeleteTeacher = () => {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState('');
  const [teacherData, setTeacherData] = useState(null);

  const fetchTeacherById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return null;
      }
      const response = await axios.get(`http://localhost:3000/api/teachers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data.data;
      if (!data) {
        setTeacherData(null);
        alert('Teacher not found. Please check the ID and try again.');
        return null;
      }
      data.date_of_birth = new Date(data.date_of_birth).toLocaleDateString('en-GB');
      return data;
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      if (error.response && error.response.status === 404) {
        setTeacherData(null);
        alert('Teacher not found. Please check the ID and try again.');
      } else if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error fetching teacher data. Please try again.');
      }
      return null;
    }
  };

  const deleteTeacher = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return;
      }
      await axios.delete(`http://localhost:3000/api/teachers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Teacher deleted successfully');
      alert('Teacher deleted successfully');
      setTeacherData(null);
    } catch (error) {
      console.error('Error deleting teacher:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error deleting teacher. Please try again.');
      }
    }
  };

  const handleSearch = async () => {
    const data = await fetchTeacherById(teacherId);
    if (data) {
      setTeacherData(data);
    } else {
      setTeacherData(null);
    }
  };

  const handleDelete = () => {
    deleteTeacher(teacherId);
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
        Delete Teacher Profile
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label="Teacher ID"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          onKeyPress={handleKeyPress}
          required
          halfWidth
          size='Small'
          variant='filled'
          sx={{textDecoration: 'none',borderColor: 'none',}}
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

      {teacherData && (
        <Box sx={{ mt: 2, height:'100vh', color: '#f1f5f9' }}>
          <Typography variant="h6">Teacher Details</Typography>
          <Typography>Name              : {teacherData.name}</Typography>
          <Typography>Gender            : {teacherData.gender}</Typography>
          <Typography>Age               : {teacherData.age}</Typography>
          <Typography>School ID         : {teacherData.school_id}</Typography>
          <Typography>Religion          : {teacherData.religion}</Typography>
          <Typography>Date of Birth     : {teacherData.date_of_birth}</Typography>
          <Typography>Nationality       : {teacherData.nationality}</Typography>
          <Typography>Qualification     : {teacherData.qualification}</Typography>
          <Typography>Email             : {teacherData.email}</Typography>
          <Typography>Phone Number      : {teacherData.phonenumber}</Typography>
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
            Delete Teacher
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DeleteTeacher;