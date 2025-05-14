import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle } from '../Admin/Student/formStyles.js';
import config from '@/assets/config';

const { url } = config;

const Attendance = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [childDetails, setChildDetails] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [dailyAttendance, setDailyAttendance] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchChildDetails();
  }, [navigate]);

  const fetchChildDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('parentToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/parent');
        return;
      }

      const response = await axios.get(`${url}/api/parents/child-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setChildDetails(response.data.data);
      fetchAllAttendance(response.data.data.student_id);
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('parentToken');
        navigate('/login/parent');
      } else {
        console.error('Error fetching child details:', error);
        alert('Error fetching child details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAttendance = async (studentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('parentToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/parent');
        return;
      }

      const response = await axios.get(`${url}/api/parents/child-attendance/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setAttendanceRecords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      alert('Error fetching attendance records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleSearch = () => {
    if (!date) {
      alert('Please select a date.');
      return;
    }


    const selectedDate = new Date(date);
    const attendance = attendanceRecords.find(record => {
      const recordDate = new Date(record.date);
      return recordDate.toDateString() === selectedDate.toDateString();
    });

    setDailyAttendance(attendance || { date, status: 'No record found' });
  };


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f172a',
        padding: '24px',
        borderRadius: '8px',
        color: '#f1f5f9',
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          color: '#f1f5f9',
          marginBottom: '24px',
        }}
      >
        Child Attendance Records
      </Typography>

      {childDetails && (
        <Box sx={{ marginBottom: '24px' }}>
          <Typography variant="h5" sx={{ color: '#f1f5f9', marginBottom: '8px' }}>
            Student Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Typography sx={{ color: '#f1f5f9' }}>
              <strong>Student ID:</strong> {childDetails.student_id}
            </Typography>
            <Typography sx={{ color: '#f1f5f9' }}>
              <strong>Name:</strong> {childDetails.name}
            </Typography>
            <Typography sx={{ color: '#f1f5f9' }}>
              <strong>Class:</strong> {childDetails.className} - {childDetails.section}
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-end' }}>
        <Box sx={formControlStyle}>
          <label htmlFor="date" style={labelStyle}>Select Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={date}
            onChange={handleDateChange}
            style={inputStyle}
          />
        </Box>
        <Button
          onClick={handleSearch}
          variant="contained"
          sx={{
            backgroundColor: '#3b82f6',
            color: '#f1f5f9',
            padding: '8px 16px',
            height: '40px',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
          }}
        >
          Search
        </Button>
      </Box>

      {dailyAttendance && (
        <Box sx={{ marginBottom: '24px', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
          <Typography variant="h6" sx={{ color: '#f1f5f9', marginBottom: '8px' }}>
            Attendance for {formatDate(dailyAttendance.date)}
          </Typography>
          <Typography 
            sx={{ 
              color: dailyAttendance.status === 'Present' ? '#4ade80' : 
                    dailyAttendance.status === 'Absent' ? '#f87171' : '#f1f5f9',
              fontWeight: 'bold'
            }}
          >
            Status: {dailyAttendance.status}
          </Typography>
        </Box>
      )}

      <Typography variant="h5" sx={{ color: '#f1f5f9', marginBottom: '16px', marginTop: '16px' }}>
        Attendance History
      </Typography>

      <Box sx={{ marginBottom: '16px' }}>
        <table style={{ width: '100%', color: '#f1f5f9', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Date</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.length > 0 ? (
              attendanceRecords.map((record, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{formatDate(record.date)}</td>
                  <td 
                    style={{ 
                      border: '1px solid #475569', 
                      padding: '8px',
                      color: record.status === 'Present' ? '#4ade80' : '#f87171',
                      fontWeight: 'bold'
                    }}
                  >
                    {record.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" style={{ border: '1px solid #475569', padding: '8px', textAlign: 'center' }}>
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default Attendance;