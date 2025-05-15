import React, { useState } from 'react';
import { Box, TextField, IconButton, Typography, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

const url = import.meta.env.URL;

const StudentList = () => {
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
      const response = await axios.get(`${url}/api/students/${id}`, {
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

  const fetchAllStudents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return [];
      }
      const response = await axios.get(`${url}/api/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all students:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      } else {
        alert('Error fetching all students. Please try again.');
      }
      return [];
    }
  };

  const handleSearch = async () => {
    const data = await fetchStudentById(studentId);
    setStudentData(data);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownloadReport = async () => {
    const students = await fetchAllStudents();
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(18);
    doc.text('All Students Report', 14, yPosition);
    yPosition += 10;

    doc.setFontSize(12);

    students.forEach((student, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont(undefined, 'bold');
      doc.text(`Student ${index + 1}:`, 14, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += 8;

      const studentData = [
        `Student ID: ${student.student_id || 'N/A'}`,
        `Name: ${student.name || 'N/A'}`,
        `Gender: ${student.gender || 'N/A'}`,
        `Age: ${student.age || 'N/A'}`,
        `Education Level: ${student.education_level || 'N/A'}`,
        `School: ${student.school || 'N/A'}`,
        `Status: ${student.status || 'N/A'}`,
        `Date of Birth: ${student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('en-GB') : 'N/A'}`,
        `Date of Admission: ${student.date_of_admission ? new Date(student.date_of_admission).toLocaleDateString('en-GB') : 'N/A'}`
      ];

      if (student.education_level === 'secondary') {
        studentData.push(`Class: ${student.class || 'N/A'}`);
      } else {
        studentData.push(`Year: ${student.year || 'N/A'}`);
      }

      if (student.education_level === 'graduation') {
        studentData.push(`Degree: ${student.degree || 'N/A'}`);
        studentData.push(`Specialization: ${student.specialization || 'N/A'}`);
      }

      studentData.push(
        `Religion: ${student.religion || 'N/A'}`,
        `Nationality: ${student.nationality || 'N/A'}`,
        `Address: ${student.address || 'N/A'}`,
        `Parent ID: ${student.parent_id || 'N/A'}`,
        `School ID: ${student.school_id || 'N/A'}`
      );

      studentData.forEach(line => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }

        const textLines = doc.splitTextToSize(line, 180);
        doc.text(textLines, 20, yPosition);
        yPosition += 7 * textLines.length; // Increase y-position based on number of lines
      });

      yPosition += 10;

      if (index < students.length - 1) {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        } else {
          doc.setDrawColor(200, 200, 200); // Light gray
          doc.line(14, yPosition - 5, 196, yPosition - 5);
          yPosition += 5;
        }
      }
    });

    doc.save('students_report.pdf');
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
        Get Students Profile
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
          sx={{ textDecoration: 'none', borderColor: 'none', }}

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
          Download All Students Report
        </Button>
      </Box>

      {studentData && (
        <Box sx={{ mt: 2, height: '100vh', color: '#f1f5f9' }}>
          <Typography variant="h6">Student Details</Typography>
          <Typography>Name              : {studentData.name}</Typography>
          <Typography>Gender            : {studentData.gender}</Typography>
          <Typography>Age               : {studentData.age}</Typography>
          <Typography>Education Level   : {studentData.education_level}</Typography>
          <Typography>School            : {studentData.school}</Typography>
          <Typography>Status            : {studentData.status}</Typography>
          <Typography>Date of Birth     : {studentData.date_of_birth}</Typography>
          <Typography>Date of Admission : {studentData.date_of_admission}</Typography>
          {studentData.education_level === 'secondary' && <Typography>Class             : {studentData.class}</Typography>}
          {studentData.education_level !== 'secondary' && <Typography>Year              : {studentData.year}</Typography>}
          {studentData.education_level === 'graduation' && (
            <>
              <Typography>Degree            : {studentData.degree}</Typography>
              <Typography>Specialization    : {studentData.specialization}</Typography>
            </>
          )}
          <Typography>Religion          : {studentData.religion}</Typography>
          <Typography>Nationality       : {studentData.nationality}</Typography>
          <Typography>Address           : {studentData.address}</Typography>
          <Typography>Parent ID         : {studentData.parent_id}</Typography>
          <Typography>School ID         : {studentData.school_id}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default StudentList;