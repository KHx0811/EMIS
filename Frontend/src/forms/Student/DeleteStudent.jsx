import React, { useState } from 'react';
import { Box, TextField, IconButton, Button, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle } from './formStyles';

const DeleteStudent = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);

  const fetchStudentById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return null;
      }
      const response = await axios.get(`http://localhost:3000/api/students/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = response.data.data;
      data.date_of_birth = new Date(data.date_of_birth).toLocaleDateString('en-GB');
      data.date_of_admission = new Date(data.date_of_admission).toLocaleDateString('en-GB');
      return data;
    } catch (error) {
      console.error('Error fetching student data:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error fetching student data. Please try again.');
      }
      return null;
    }
  };

  const deleteStudent = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return;
      }
      await axios.delete(`http://localhost:3000/api/students/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Student deleted successfully');
      alert('Student deleted successfully');
      setStudentData(null);
    } catch (error) {
      console.error('Error deleting student:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error deleting student. Please try again.');
      }
    }
  };

  const handleSearch = async () => {
    const data = await fetchStudentById(studentId);
    if (data) {
      setStudentData(data);
    } else {
      setStudentData(null);
    }
  };

  const handleDelete = () => {
    deleteStudent(studentId);
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
        backgroundColor: '#0f172a', // Dark background color
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
        Delete Student Profile
      </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
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

      {studentData && (
        <Box sx={{ mt: 2, height:'100vh', color: '#f1f5f9' }}>
          <Typography variant="h6">Student Details</Typography>
          <Typography>Name: {studentData.name}</Typography>
          <Typography>Gender: {studentData.gender}</Typography>
          <Typography>Age: {studentData.age}</Typography>
          <Typography>Education Level: {studentData.education_level}</Typography>
          <Typography>School: {studentData.school}</Typography>
          <Typography>Status: {studentData.status}</Typography>
          <Typography>Date of Birth: {studentData.date_of_birth}</Typography>
          <Typography>Date of Admission: {studentData.date_of_admission}</Typography>
          {studentData.education_level === 'secondary' && <Typography>Class: {studentData.class}</Typography>}
          {studentData.education_level !== 'secondary' && <Typography>Year: {studentData.year}</Typography>}
          {studentData.education_level === 'graduation' && (
            <>
              <Typography>Degree: {studentData.degree}</Typography>
              <Typography>Specialization: {studentData.specialization}</Typography>
            </>
          )}
          <Typography>Religion: {studentData.religion}</Typography>
          <Typography>Nationality: {studentData.nationality}</Typography>
          <Typography>Address: {studentData.address}</Typography>
          <Typography>Parent ID: {studentData.parent_id}</Typography>
          <Typography>School ID: {studentData.school_id}</Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleDelete}
            sx={{ 
              backgroundColor: '#3b82f6', // Button background color
              color: '#f1f5f9', // Button text color
              padding: '8px 16px',
              marginTop: '16px',
              '&:hover': {
                backgroundColor: '#2563eb', // Button hover background color
              }
            }}
          >
            Delete Student
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DeleteStudent;