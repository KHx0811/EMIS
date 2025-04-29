import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../Admin/Student/formStyles.js';

const Attendance = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/teachers/teacher-classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(response.data.data);
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('teacherToken');
        navigate('/login/teacher');
      } else {
        console.error('Error fetching classes:', error);
        alert('Error fetching classes. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [navigate]);

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setStudents([]);
    setAttendanceData([]);

    if (!classId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const response = await axios.get(`http://localhost:3000/api/teachers/class-students/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.data && response.data.data.length > 0) {
        setStudents(response.data.data);
        setAttendanceData(
          response.data.data.map((student) => ({
            studentId: student.student_id,
            status: '',
          }))
        );
      } else {
        alert('No students found in this class.');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('teacherToken');
        navigate('/login/teacher');
      } else {
        console.error('Error fetching students:', error);
        alert('Error fetching students. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prevData) =>
      prevData.map((entry) =>
        entry.studentId === studentId ? { ...entry, status } : entry
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      alert('Please select a date.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const payload = {
        classId: selectedClass,
        date,
        attendance: attendanceData,
      };

      await axios.post('http://localhost:3000/api/teachers/upload-attendance', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      alert('Attendance submitted successfully');
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Error submitting attendance. Please try again.');
    } finally {
      setLoading(false);
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
        Attendance Form
      </Typography>

      <Box sx={formControlStyle}>
        <label htmlFor="class" style={labelStyle}>Select Class *</label>
        <Select
          id="class"
          value={selectedClass}
          onChange={handleClassChange}
          required
          sx={selectStyle}
          disabled={loading}
        >
          <MenuItem value="" disabled>Select a class</MenuItem>
          {classes.map((classItem) => (
            <MenuItem key={classItem._id} value={classItem._id}>
              {classItem.className} - {classItem.section}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={formControlStyle}>
        <label htmlFor="date" style={labelStyle}>Date *</label>
        <input
          id="date"
          name="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={inputStyle}
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
                    sx={selectStyle}
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
              backgroundColor: '#2563eb',
            },
          }}
        >
          Submit Attendance
        </Button>
      </Box>
    </Box>
  );
};

export default Attendance;