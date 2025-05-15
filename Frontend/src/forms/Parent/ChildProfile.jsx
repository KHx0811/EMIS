import React, { useEffect, useState } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const url = import.meta.env.URL;

const ChildProfile = () => {
  const [childData, setChildData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const token = localStorage.getItem('parentToken');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get(`${url}/api/parents/child-details`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setChildData(response.data.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching child data:', error);
        setError(error.response?.data?.message || 'Error fetching child data');
      }
    };

    fetchChildData();
  }, []);

  return (
    <Box sx={{ padding: '24px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
      <Typography variant="h3" sx={{ color: '#f1f5f9', marginBottom: '16px' }}>
        Child Profile
      </Typography>
      {error && (
        <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}
      {childData && (
        <Box sx={{ marginTop: '16px', color: '#f1f5f9' }}>
          <Typography>Name: {childData.name}</Typography>
          <Typography>Student ID: {childData.student_id}</Typography>
          <Typography>Gender: {childData.gender}</Typography>
          <Typography>Age: {childData.age}</Typography>
          <Typography>Education Level: {childData.education_level}</Typography>
          <Typography>School: {childData.school}</Typography>
          <Typography>Status: {childData.status}</Typography>
          <Typography>Date of Birth: {new Date(childData.date_of_birth).toLocaleDateString()}</Typography>
          <Typography>Date of Admission: {new Date(childData.date_of_admission).toLocaleDateString()}</Typography>
          {childData.education_level === 'secondary' && (
            <Typography>Class: {childData.class}</Typography>
          )}
          {childData.education_level !== 'secondary' && (
            <Typography>Year: {childData.year}</Typography>
          )}
          {childData.education_level === 'graduation' && (
            <>
              <Typography>Degree: {childData.degree}</Typography>
              <Typography>Specialization: {childData.specialization}</Typography>
            </>
          )}
          <Typography>Religion: {childData.religion}</Typography>
          <Typography>Nationality: {childData.nationality}</Typography>
          <Typography>Address: {childData.address}</Typography>
          <Typography>Parent ID: {childData.parent_id}</Typography>
          <Typography>School ID: {childData.school_id}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChildProfile;