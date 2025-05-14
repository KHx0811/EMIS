import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Select, MenuItem, TextField } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '@/assets/config';

const { url } = config;

const AssignAssignment = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
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
        console.error('Error fetching classes:', error);
        alert('Error fetching classes. Please try again.');
      }
    };

    fetchClasses();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClass || !formData.title || !formData.description || !formData.dueDate) {
      alert('All fields are required.');
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
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
      };

      await axios.post(`${url}/api/teachers/assign-assignment`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      alert('Assignment assigned successfully');
      setFormData({ title: '', description: '', dueDate: '' });
      setSelectedClass('');
    } catch (error) {
      console.error('Error assigning assignment:', error);
      alert('Error assigning assignment. Please try again.');
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
      <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#f1f5f9', marginBottom: '24px' }}>
        Assign Assignment
      </Typography>

      <Box sx={{ marginBottom: '16px' }}>
        <label htmlFor="class-select" style={{ color: '#f1f5f9' }}>Select Class *</label>
        <Select
          id="class-select"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          required
          sx={{
            backgroundColor: '#1F2A40',
            color: '#e0e0e0',
            width: '100%',
          }}
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

      <Box sx={{ marginBottom: '16px' }}>
        <label htmlFor="title" style={{ color: '#f1f5f9' }}>Assignment Title *</label>
        <TextField
          id="title"
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          fullWidth
          sx={{
            backgroundColor: '#1F2A40',
            color: '#e0e0e0',
          }}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label htmlFor="description" style={{ color: '#f1f5f9' }}>Description *</label>
        <TextField
          id="description"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          multiline
          rows={4}
          fullWidth
          sx={{
            backgroundColor: '#1F2A40',
            color: '#e0e0e0',
          }}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label htmlFor="dueDate" style={{ color: '#f1f5f9' }}>Due Date *</label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          required
          style={{
            backgroundColor: '#1F2A40',
            color: '#e0e0e0',
            width: '100%',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #3d3d3d',
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: '#3b82f6',
            color: '#f1f5f9',
            padding: '8px 16px',
            '&:hover': { backgroundColor: '#2563eb' },
            '&:disabled': { backgroundColor: '#64748b', color: '#cbd5e1' },
          }}
        >
          {loading ? 'Assigning...' : 'Assign Assignment'}
        </Button>
      </Box>
    </Box>
  );
};

export default AssignAssignment;