import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Select, MenuItem, TextField, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../Admin/Student/formStyles.js';

const Marks = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [marksData, setMarksData] = useState([]);
  const [formData, setFormData] = useState({ 
    subject: '', 
    type: 'Monthly'
  });
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
    setMarksData([]);
  
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
        setMarksData(
          response.data.data.map((student) => ({
            studentId: student.student_id,
            marks: '',
            maxMarks: '',
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

  const handleMarksChange = (studentId, field, value) => {
    setMarksData((prevData) =>
      prevData.map((entry) => 
        entry.studentId === studentId ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClass) {
      alert('Please select a class.');
      return;
    }
    
    if (!formData.subject) {
      alert('Please enter a subject.');
      return;
    }
    
    if (!formData.type) {
      alert('Please enter an exam type.');
      return;
    }
    
    const invalidEntries = marksData.filter(
      entry => entry.marks === '' || entry.maxMarks === ''
    );
    
    if (invalidEntries.length > 0) {
      alert('Please enter marks and max marks for all students.');
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
        subject: formData.subject,
        type: formData.type,
        marks: marksData 
      };
      
      await axios.post('http://localhost:3000/api/teachers/upload-marks', payload, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
      });

      alert('Marks uploaded successfully');
      
      setMarksData(students.map(student => ({ 
        studentId: student.student_id, 
        marks: '', 
        maxMarks: '' 
      })));
    } catch (error) {
      console.error('Error uploading marks:', error);
      alert(`Error uploading marks: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const examTypes = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Unit Test', 'Project'];

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
      <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#f1f5f9', marginBottom: '24px' }}>
        Upload Marks
      </Typography>

      <Box sx={formControlStyle}>
        <label style={labelStyle} htmlFor="class-select">Select Class *</label>
        <Select
          id="class-select"
          value={selectedClass}
          onChange={handleClassChange}
          required
          sx={selectStyle}
          disabled={loading}
        >
          <MenuItem value="" disabled>
            Select Class
          </MenuItem>
          {classes.map((cls) => (
            <MenuItem key={cls._id} value={cls._id}>
              {cls.className} - {cls.section}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={formControlStyle}>
        <label style={labelStyle} htmlFor="subject">Subject *</label>
        <input
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
          style={inputStyle}
          disabled={loading}
        />
      </Box>

      <Box sx={formControlStyle}>
        <label style={labelStyle} htmlFor="exam-type">Exam Type *</label>
        <Select
          id="exam-type"
          name="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          required
          sx={selectStyle}
          disabled={loading}
        >
          {examTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {students.length > 0 && (
        <Box sx={{ marginBottom: '16px', maxHeight: '600px', overflowY: 'auto' }}>
          <table style={{ width: '100%', color: '#f1f5f9', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1e293b' }}>
              <tr>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Student ID</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Marks Obtained</th>
                <th style={{ border: '1px solid #475569', padding: '8px' }}>Total Marks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.student_id}>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{student.student_id}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{student.name}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      value={marksData.find((entry) => entry.studentId === student.student_id)?.marks || ''}
                      onChange={(e) => handleMarksChange(student.student_id, 'marks', e.target.value)}
                      required
                      style={inputStyle}
                      disabled={loading}
                    />
                  </td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>
                    <input
                      type="number"
                      min="1"
                      value={marksData.find((entry) => entry.studentId === student.student_id)?.maxMarks || ''}
                      onChange={(e) => handleMarksChange(student.student_id, 'maxMarks', e.target.value)}
                      required
                      style={inputStyle}
                      disabled={loading}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || students.length === 0}
          sx={{
            backgroundColor: '#3b82f6',
            color: '#f1f5f9',
            padding: '8px 16px',
            '&:hover': { backgroundColor: '#2563eb' },
            '&:disabled': { backgroundColor: '#64748b', color: '#cbd5e1' }
          }}
        >
          {loading ? 'Uploading...' : 'Upload Marks'}
        </Button>
      </Box>
    </Box>
  );
};

export default Marks;