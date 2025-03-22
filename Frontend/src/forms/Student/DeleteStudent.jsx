import React, { useState } from 'react';
import { Box, TextField, IconButton, Button, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const DeleteStudent = () => {
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);

  const fetchStudentById = async (id) => {
    try {
      const token = localStorage.getItem('adminToken'); // Assuming the token is stored in localStorage
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
      alert('Error fetching student data. Please try again.');
      return null;
    }
  };

  const deleteStudent = async (id) => {
    try {
      const token = localStorage.getItem('adminToken'); // Assuming the token is stored in localStorage
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
      alert('Error deleting student. Please try again.');
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h3" component="h1" gutterBottom>
                Delete Student Profile
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />
        <IconButton onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Box>

      {studentData && (
        <Box sx={{ mt: 2 }}>
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
          <Button variant="contained" color="secondary" onClick={handleDelete}>Delete</Button>
        </Box>
      )}
    </Box>
  );
};

export default DeleteStudent;