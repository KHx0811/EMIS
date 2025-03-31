import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Attendance = ({ onSubmit = () => {} }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('teacherToken');
        if (!token) {
          alert('You are not logged in. Please login to continue.');
          navigate('/login/teacher');
          return;
        }
  
        const response = await axios.get('http://localhost:3000/api/teachers/all-students', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        console.log('API Response:', response.data);
  
        // Extract students from the correct property
        const studentsData = Array.isArray(response.data.data) ? response.data.data : [];
  
        if (studentsData.length === 0) {
          console.warn('No students found in the response.');
          alert('No students found. Please check with the administrator.');
        }
  
        setStudents(studentsData);
        setAttendanceData(
          studentsData.map((student) => ({
            studentId: student.student_id,
            status: '' // Default status is empty
          }))
        );
      } catch (error) {
        console.error('Error fetching students:', error);
        alert('Error fetching students. Please try again.');
      }
    };
  
    fetchStudents();
  }, [navigate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prevData) =>
      prevData.map((entry) =>
        entry.studentId === studentId ? { ...entry, status } : entry
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const payload = {
        date,
        attendance: attendanceData
      };

      const response = await axios.post('http://localhost:3000/api/teachers/upload-attendance', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Attendance submitted successfully:', response.data);
      alert('Attendance submitted successfully');
      onSubmit(response.data);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Error submitting attendance. Please try again.');
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
        Attendance Form
      </Typography>

      <Box sx={{ marginBottom: '16px' }}>
        <label htmlFor="date" style={{ color: '#f1f5f9' }}>Date *</label>
        <input
          id="date"
          name="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{
            backgroundColor: '#1F2A40',
            color: '#e0e0e0',
            width: '100%',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #3d3d3d'
          }}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <table style={{ width: '100%', color: '#f1f5f9', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Student ID</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.student_id}>
                <td style={{ border: '1px solid #475569', padding: '8px' }}>{student.student_id}</td>
                <td style={{ border: '1px solid #475569', padding: '8px' }}>{student.name}</td>
                <td style={{ border: '1px solid #475569', padding: '8px' }}>
                  <Select
                    value={
                      attendanceData.find((entry) => entry.studentId === student.student_id)?.status || ''
                    }
                    onChange={(e) => handleStatusChange(student.student_id, e.target.value)}
                    required
                    sx={{
                      backgroundColor: '#1F2A40',
                      color: '#e0e0e0',
                      width: '100%'
                    }}
                  >
                    <MenuItem value="" disabled>Select Status</MenuItem>
                    <MenuItem value="Present">Present</MenuItem>
                    <MenuItem value="Absent">Absent</MenuItem>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              backgroundColor: '#2563eb'
            }
          }}
        >
          Submit Attendance
        </Button>
      </Box>
    </Box>
  );
};

export default Attendance;