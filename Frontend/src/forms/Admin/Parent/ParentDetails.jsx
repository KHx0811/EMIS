import React, { useState } from 'react';
import { Box, TextField, IconButton, Typography, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ParentDetails = () => {
  const navigate = useNavigate();
  const [parentId, setParentId] = useState('');
  const [parentData, setParentData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [showStudent, setShowStudent] = useState(false);

  const fetchParentById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return null;
      }
      const response = await axios.get(`http://localhost:3000/api/parents/${id}`, {
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

  const fetchStudentByParentId = async (parentId) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return null;
      }
      const response = await axios.get(`http://localhost:3000/api/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const student = response.data.data.find(student => student.parent_id === parentId);
      
      if (student) {
        student.date_of_birth = new Date(student.date_of_birth).toLocaleDateString('en-GB');
        student.date_of_admission = new Date(student.date_of_admission).toLocaleDateString('en-GB');
        return student;
      }
      
      return null;
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

  const handleSearch = async () => {
    const data = await fetchParentById(parentId);
    setParentData(data);
    setShowStudent(false);
    setStudentData(null);
  };

  const handleShowStudentDetails = async () => {
    if (parentData) {
      const studentData = await fetchStudentByParentId(parentData.parent_id);
      setStudentData(studentData);
      setShowStudent(true);
    }
  };

  const handleNavigateToStudentDetails = () => {
    if (studentData) {
      navigate(`/students/${studentData.student_id}`);
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
        Get Parents Profile
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

      {parentData && (
        <Box sx={{ mt: 2, color: '#f1f5f9' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Parent Details</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleShowStudentDetails} 
              sx={{ 
                backgroundColor: '#3b82f6',
                color: '#f1f5f9',
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: '#2563eb',
                }
              }}
            >
              Show Student Details
            </Button>
          </Box>
          <Typography>Parent ID             : {parentData.parent_id}</Typography>
          <Typography>Student ID          : {parentData.student_id}</Typography>
          <Typography>Name                  : {parentData.name}</Typography>
          <Typography>Relation   : {parentData.relation}</Typography>
          <Typography>Contact    : {parentData.phonenumber}</Typography>
          <Typography>Email    : {parentData.email}</Typography>
          <Typography>Qualification             : {parentData.qualification}</Typography>
          <Typography>Age             : {parentData.age}</Typography>
          <Typography>Date Of Birth   : {parentData.date_of_birth}</Typography>
        </Box>
      )}

      {showStudent && studentData && (
        <Box sx={{ mt: 4, color: '#f1f5f9' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Associated Student Details</Typography>
          </Box>
          <Typography>Student ID         : {studentData.student_id}</Typography>
          <Typography>Name               : {studentData.name}</Typography>
          <Typography>Gender             : {studentData.gender}</Typography>
          <Typography>Age                : {studentData.age}</Typography>
          <Typography>Education Level    : {studentData.education_level}</Typography>
          <Typography>School             : {studentData.school}</Typography>
          <Typography>Status             : {studentData.status}</Typography>
          <Typography>Date of Birth      : {studentData.date_of_birth}</Typography>
          <Typography>Date of Admission  : {studentData.date_of_admission}</Typography>
          {studentData.education_level === 'secondary' && <Typography>Class             : {studentData.class}</Typography>}
          {studentData.education_level !== 'secondary' && <Typography>Year              : {studentData.year}</Typography>}
          {studentData.education_level === 'graduation' && (
            <>
              <Typography>Degree            : {studentData.degree}</Typography>
              <Typography>Specialization    : {studentData.specialization}</Typography>
            </>
          )}
          <Typography>Religion           : {studentData.religion}</Typography>
          <Typography>Nationality        : {studentData.nationality}</Typography>
          <Typography>Address            : {studentData.address}</Typography>
          <Typography>School ID          : {studentData.school_id}</Typography>
        </Box>
      )}

      {showStudent && !studentData && (
        <Box sx={{ mt: 4, color: '#f1f5f9' }}>
          <Typography variant="h6">No student record found for this parent.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ParentDetails;