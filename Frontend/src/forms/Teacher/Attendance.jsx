import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Select, MenuItem, TextField, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../Admin/Student/formStyles.js';

const url = import.meta.env.VITE_API_URL;


const Attendance = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const [loading, setLoading] = useState(false);
  
  const [searchStudentId, setSearchStudentId] = useState('');
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const response = await axios.get(`${url}/api/teachers/teacher-classes`, {
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
    setStudentAttendance(null);

    if (!classId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const response = await axios.get(`${url}/api/teachers/class-students/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.data && response.data.data.length > 0) {
        setStudents(response.data.data);

        const attendanceResponse = await axios.get(
          `${url}/api/teachers/get-attendance/${classId}/${date}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (attendanceResponse.data.data && attendanceResponse.data.data.length > 0) {
          setAttendanceData(attendanceResponse.data.data);
          setIsEditMode(true);
        } else {
          setAttendanceData(
            response.data.data.map((student) => ({
              studentId: student.student_id,
              status: '',
            }))
          );
          setIsEditMode(false);
        }
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

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    
    if (selectedClass) {
      try {
        setLoading(true);
        const token = localStorage.getItem('teacherToken');
        
        const attendanceResponse = await axios.get(
          `${url}/api/teachers/get-attendance/${selectedClass}/${newDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (attendanceResponse.data.data && attendanceResponse.data.data.length > 0) {
          setAttendanceData(attendanceResponse.data.data);
          setIsEditMode(true);
        } else {
          setAttendanceData(
            students.map((student) => ({
              studentId: student.student_id,
              status: '',
            }))
          );
          setIsEditMode(false);
        }
      } catch (error) {
        console.error('Error checking attendance data:', error);
      } finally {
        setLoading(false);
      }
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
        isUpdate: isEditMode
      };

      const endpoint = isEditMode 
        ? `${url}/api/teachers/update-attendance` 
        : `${url}/api/teachers/upload-attendance`;

      await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      alert(`Attendance ${isEditMode ? 'updated' : 'submitted'} successfully`);
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'submitting'} attendance:`, error);
      alert(`Error ${isEditMode ? 'updating' : 'submitting'} attendance. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSearch = async () => {
    if (!searchStudentId) {
      alert('Please enter a student ID');
      return;
    }

    try {
      setSearchLoading(true);
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const response = await axios.get(
        `${url}/api/teachers/student-attendance/${searchStudentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.data) {
        setStudentAttendance(response.data.data);
      } else {
        alert('No attendance records found for this student.');
        setStudentAttendance(null);
      }
    } catch (error) {
      console.error('Error searching student attendance:', error);
      alert('Error searching student attendance. Please try again.');
      setStudentAttendance(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUpdateStudentAttendance = async (attendanceId, newStatus) => {
    try {
      setSearchLoading(true);
      const token = localStorage.getItem('teacherToken');
      
      await axios.post(
        `${url}/api/teachers/update-student-attendance`,
        { attendanceId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Attendance updated successfully');
      
      handleStudentSearch();
    } catch (error) {
      console.error('Error updating student attendance:', error);
      alert('Error updating student attendance. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '8px', color: '#f1f5f9' }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        sx={{
          color: '#f1f5f9',
          marginBottom: '24px',
        }}
      >
        Attendance Management
      </Typography>


      <Box
        sx={{
          backgroundColor: '#1e293b',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#f1f5f9' }}>
          Search Student Attendance
        </Typography>
        
        <Box sx={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '16px' }}>
          <Box sx={{ flex: 1 }}>
            <label htmlFor="searchStudentId" style={labelStyle}>Student ID</label>
            <TextField
              id="searchStudentId"
              value={searchStudentId}
              onChange={(e) => setSearchStudentId(e.target.value)}
              placeholder="Enter student ID"
              fullWidth
              sx={{
                input: { color: '#f1f5f9' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#475569' },
                  '&:hover fieldset': { borderColor: '#64748b' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                },
              }}
            />
          </Box>
          <Button
            onClick={handleStudentSearch}
            variant="contained"
            disabled={searchLoading}
            sx={{
              backgroundColor: '#3b82f6',
              color: '#f1f5f9',
              padding: '16px 20px',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
          >
            {searchLoading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
          </Button>
        </Box>

        {studentAttendance && (
          <Box sx={{ marginTop: '16px' }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#f1f5f9' }}>
              Attendance Records
            </Typography>
            <table style={{ width: '100%', color: '#f1f5f9', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #475569', padding: '8px' }}>Date</th>
                  <th style={{ border: '1px solid #475569', padding: '8px' }}>Status</th>
                  <th style={{ border: '1px solid #475569', padding: '8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentAttendance.map((record) => (
                  <tr key={record._id}>
                    <td style={{ border: '1px solid #475569', padding: '8px' }}>
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.status}</td>
                    <td style={{ border: '1px solid #475569', padding: '8px' }}>
                      <Select
                        value={record.status}
                        onChange={(e) => handleUpdateStudentAttendance(record._id, e.target.value)}
                        sx={{
                          ...selectStyle,
                          minWidth: '120px',
                        }}
                      >
                        <MenuItem value="Present">Present</MenuItem>
                        <MenuItem value="Absent">Absent</MenuItem>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Box>

      {/* Class Attendance Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          backgroundColor: '#1e293b',
          padding: '16px',
          borderRadius: '8px',
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#f1f5f9' }}>
          {isEditMode ? 'Update Class Attendance' : 'Record Class Attendance'}
        </Typography>

        <Box sx={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <Box sx={{ flex: 1, ...formControlStyle }}>
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

          <Box sx={{ flex: 1, ...formControlStyle }}>
            <label htmlFor="date" style={labelStyle}>Date *</label>
            <input
              id="date"
              name="date"
              type="date"
              value={date}
              onChange={handleDateChange}
              required
              style={inputStyle}
            />
          </Box>
        </Box>

        {students.length > 0 && (
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
                {students.map((student) => {
                  const attendanceEntry = attendanceData.find(
                    (entry) => entry.studentId === student.student_id
                  );
                  return (
                    <tr key={student.student_id}>
                      <td style={{ border: '1px solid #475569', padding: '8px' }}>{student.student_id}</td>
                      <td style={{ border: '1px solid #475569', padding: '8px' }}>{student.name}</td>
                      <td style={{ border: '1px solid #475569', padding: '8px' }}>
                        <Select
                          value={attendanceEntry?.status || ''}
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
                  );
                })}
              </tbody>
            </table>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#3b82f6',
              color: '#f1f5f9',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isEditMode ? 'Update Attendance' : 'Submit Attendance'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Attendance;