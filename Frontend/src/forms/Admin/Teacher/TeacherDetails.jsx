import React, { useState } from 'react';
import { Box, TextField, IconButton, Typography, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

const url = import.meta.env.VITE_API_URL;

const TeacherDetails = () => {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState('');
  const [teacherData, setTeacherData] = useState(null);

  const fetchTeacherById = async (id) => {
  
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('You are not logged in. Please login to continue.');
      navigate('/login/admin');
      return null;
    }
  
    try {
      const response = await axios.get(`${url}/api/teachers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data && response.data.data) {
        const data = response.data.data;
        data.date_of_birth = new Date(data.date_of_birth).toLocaleDateString('en-GB'); 
        
        return data;
      } else {
        alert('Teacher not found. Please check the ID and try again.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error fetching teacher data. Please try again.');
      }
      return null;
    }
  };

  const fetchAllTeachers = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('You are not logged in. Please login to continue.');
      navigate('/login/admin');
      return [];
    }
    
    try {
      const response = await axios.get(`${url}/api/teachers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error fetching all teachers. Please try again.');
      }
      return [];
    }
  };

  const handleSearch = async () => {
    const data = await fetchTeacherById(teacherId);
    setTeacherData(data);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownloadReport = async () => {
    const teachers = await fetchAllTeachers();
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(18);
    doc.text('All Teachers Report', 14, yPosition);
    yPosition += 10;

    doc.setFontSize(12);

    teachers.forEach((teacher, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont(undefined, 'bold');
      doc.text(`Teacher ${index + 1}:`, 14, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += 8;

      const teacherData = [
        `Teacher ID: ${teacher.teacher_id || 'N/A'}`,
        `Name: ${teacher.name || 'N/A'}`,
        `Gender: ${teacher.gender || 'N/A'}`,
        `Age: ${teacher.age || 'N/A'}`,
        `School ID: ${teacher.school_id || 'N/A'}`,
        `Religion: ${teacher.religion || 'N/A'}`,
        `Date of Birth: ${teacher.date_of_birth ? new Date(teacher.date_of_birth).toLocaleDateString('en-GB') : 'N/A'}`,
        `Nationality: ${teacher.nationality || 'N/A'}`,
        `Qualification: ${teacher.qualification || 'N/A'}`,
        `Email: ${teacher.email || 'N/A'}`,
        `Phone Number: ${teacher.phonenumber || 'N/A'}`
      ];

      teacherData.forEach(line => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }

        const textLines = doc.splitTextToSize(line, 180);
        doc.text(textLines, 20, yPosition);
        yPosition += 7 * textLines.length;
      });

      yPosition += 10;

      if (index < teachers.length - 1) {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        } else {
          doc.setDrawColor(200, 200, 200);
          doc.line(14, yPosition - 5, 196, yPosition - 5);
          yPosition += 5;
        }
      }
    });

    doc.save('teachers_report.pdf');
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
        Get Teacher Profile
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label="Teacher ID"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          onKeyPress={handleKeyPress}
          required
          fullWidth
          size='Small'
          variant='filled'
          sx={{ textDecoration: 'none', borderColor: 'none' }}
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
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownloadReport}
          sx={{
            backgroundColor: '#3b82f6',
            color: '#f1f5f9',
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
            marginLeft: 'auto'
          }}
        >
          Download All Teachers Report
        </Button>
      </Box>

      {teacherData && (
        <Box sx={{ mt: 2, height: '100vh', color: '#f1f5f9' }}>
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
        </Box>
      )}
    </Box>
  );
};

export default TeacherDetails;