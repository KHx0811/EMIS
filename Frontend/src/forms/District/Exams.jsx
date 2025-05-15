import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  FormHelperText,
  Checkbox,
  ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';
import SubjectIcon from '@mui/icons-material/Subject';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../Admin/Student/formStyles';

const url = import.meta.env.URL;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
      backgroundColor: '#1F2A40',
      color: '#f1f5f9',
    },
  },
};

const examTypes = [
  'Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Unit Test', 'Project'
];

const examStatuses = [
  'scheduled',
  'ongoing',
  'completed',
  'cancelled',
  'postponed'
];

const gradeOptions = [
  'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
];

const Exams = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [exams, setExams] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentExamId, setCurrentExamId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [examStats, setExamStats] = useState(null);

  const [formData, setFormData] = useState({
    exam_name: '',
    exam_type: 'midterm',
    subject: '',
    start_date: new Date(),
    end_date: new Date(Date.now() + 86400000), // Add 1 day
    registration_deadline: new Date(),
    centers: [],
    eligible_grades: [],
    description: '',
    status: 'scheduled',
    max_score: 100,
    passing_score: 40,
    duration_minutes: 120,
    instructions: ''
  });

  useEffect(() => {
    fetchSchools();
    fetchExams();
    fetchExamStats();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('districtToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/district');
        return;
      }

      const response = await axios.get(`${url}/api/districts/schools`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        setSchools(response.data.data);
        if (response.data.data.length === 0) {
          console.warn('No schools found for this district');
        }
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Error parsing schools data. Please contact support.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schools:', error);
      setError('Error fetching schools. Please try again.');
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('districtToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/district');
        return;
      }

      const response = await axios.get(`${url}/api/districts/exams`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setExams(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Error fetching exams. Please try again.');
      setLoading(false);
    }
  };

  const fetchExamStats = async () => {
    try {
      const token = localStorage.getItem('districtToken');
      if (!token) {
        return;
      }

      const response = await axios.get(`${url}/api/districts/exam-stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setExamStats(response.data.data || null);
    } catch (error) {
      console.error('Error fetching exam stats:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      exam_name: '',
      exam_type: 'midterm',
      subject: '',
      start_date: new Date(),
      end_date: new Date(Date.now() + 86400000),
      registration_deadline: new Date(),
      centers: [],
      eligible_grades: [],
      description: '',
      status: 'scheduled',
      max_score: 100,
      passing_score: 40,
      duration_minutes: 120,
      instructions: ''
    });
    setEditMode(false);
    setCurrentExamId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (['max_score', 'passing_score', 'duration_minutes'].includes(name)) {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : parseInt(value, 10)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleMultiSelectChange = (event, fieldName) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      [fieldName]: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleDateChange = (e, field) => {
    if (e.target.value) {
      setFormData({
        ...formData,
        [field]: new Date(e.target.value),
      });
    } else {
      setFormData({
        ...formData,
        [field]: new Date(),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.exam_name || !formData.subject || formData.centers.length === 0) {
      setError('Exam name, subject, and at least one center are required.');
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError('End date must be after the start date.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('districtToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/district');
        return;
      }

      if (editMode && currentExamId) {
        await axios.put(`${url}/api/districts/exams/${currentExamId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        setSuccess('Exam updated successfully');
      } else {
        await axios.post(`${url}/api/districts/exams`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        setSuccess('Exam created successfully');
      }

      resetForm();
      setShowCreateForm(false);
      fetchExams();
      fetchExamStats();
    } catch (error) {
      console.error('Error with exam:', error);
      setError(`Error: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExamClick = (exam) => {
    setFormData({
      exam_name: exam.exam_name,
      exam_type: exam.exam_type,
      subject: exam.subject,
      start_date: new Date(exam.start_date),
      end_date: new Date(exam.end_date),
      registration_deadline: new Date(exam.registration_deadline),
      centers: exam.centers,
      eligible_grades: exam.eligible_grades || [],
      description: exam.description || '',
      status: exam.status,
      max_score: exam.max_score,
      passing_score: exam.passing_score,
      duration_minutes: exam.duration_minutes,
      instructions: exam.instructions || ''
    });

    setCurrentExamId(exam.exam_id);
    setEditMode(true);
    setShowCreateForm(true);
  };

  const handleDeleteClick = (e, exam) => {
    e.stopPropagation();
    setExamToDelete(exam);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteExam = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('districtToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/district');
        return;
      }

      await axios.delete(`${url}/api/districts/exams/${examToDelete.exam_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Exam deleted successfully!');
      setDeleteConfirmOpen(false);
      setExamToDelete(null);
      fetchExams();
      fetchExamStats();

      if (editMode && currentExamId === examToDelete.exam_id) {
        resetForm();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      setError(error.response?.data?.message || 'Error deleting exam. Please try again.');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const getExamTypeColor = (type) => {
    const colors = {
      'midterm': '#3b82f6',
      'final': '#ef4444',
      'quarterly': '#8b5cf6',
      'entrance': '#f59e0b',
      'standardized': '#10b981',
      'aptitude': '#6366f1',
      'other': '#64748b'
    };
    return colors[type] || colors['other'];
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
  };

  const getSchoolName = (schoolId) => {
    const school = schools.find(s => s.school_id === schoolId);
    return school ? school.name : schoolId;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f172a',
        padding: '24px',
        borderRadius: '8px',
        minHeight: '80vh'
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
        Examination Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: '16px', backgroundColor: '#321b1b', color: '#f87171' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ marginBottom: '16px', backgroundColor: '#1b3225', color: '#6ee7b7' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {examStats && (
        <Box sx={{
          backgroundColor: '#1F2A40',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.25rem' }}>
            Examination Overview
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Box sx={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Exams</Typography>
              <Typography sx={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {examStats.totalExams}
              </Typography>
            </Box>
            <Box sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Upcoming (30 days)</Typography>
              <Typography sx={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {examStats.upcomingExamsCount}
              </Typography>
            </Box>

            <Box sx={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Scheduled</Typography>
              <Typography sx={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {examStats.statusCounts.scheduled}
              </Typography>
            </Box>

            <Box sx={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Ongoing</Typography>
              <Typography sx={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {examStats.statusCounts.ongoing}
              </Typography>
            </Box>

            <Box sx={{ backgroundColor: 'rgba(107, 114, 128, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #6b7280' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Completed</Typography>
              <Typography sx={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {examStats.statusCounts.completed}
              </Typography>
            </Box>
          </Box>

          {examStats.nextExam && (
            <Box sx={{
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              padding: '16px',
              borderRadius: '8px',
              marginTop: '16px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '8px' }}>
                Next Exam
              </Typography>
              <Typography sx={{ color: '#f1f5f9', fontSize: '1.125rem', fontWeight: 'medium' }}>
                {examStats.nextExam.exam_name} ({examStats.nextExam.subject})
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                <CalendarTodayIcon sx={{ color: '#94a3b8', fontSize: '1rem', marginRight: '8px' }} />
                <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                  {formatDate(examStats.nextExam.start_date)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}


      <Box sx={{ marginBottom: '24px' }}>
        <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.25rem' }}>
          {exams.length} Examinations:
        </Typography>

        {loading && !showCreateForm ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress sx={{ color: '#3b82f6' }} />
          </Box>
        ) : exams.length === 0 ? (
          <Box sx={{
            backgroundColor: '#1F2A40',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <Typography sx={{ color: '#f1f5f9', marginBottom: '16px' }}>
              No exams found. Create a new examination.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setShowCreateForm(true)}
              sx={{
                backgroundColor: '#3b82f6',
                color: '#f1f5f9',
                '&:hover': { backgroundColor: '#2563eb' }
              }}
            >
              Create Exam
            </Button>
          </Box>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {exams.map((exam) => (
              <Box
                key={exam.exam_id}
                sx={{
                  backgroundColor: '#1F2A40',
                  padding: '16px',
                  borderRadius: '8px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  borderLeft: `4px solid ${getExamTypeColor(exam.exam_type)}`,
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                  }
                }}
                onClick={() => handleExamClick(exam)}
              >
                <DeleteIcon
                  sx={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    '&:hover': { color: '#b91c1c' }
                  }}
                  onClick={(e) => handleDeleteClick(e, exam)}
                />

                <EditIcon
                  sx={{
                    position: 'absolute',
                    top: '16px',
                    right: '48px',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    '&:hover': { color: '#2563eb' }
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Box sx={{
                    bgcolor: getExamTypeColor(exam.exam_type),
                    color: 'white',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {exam.exam_type.charAt(0).toUpperCase() + exam.exam_type.slice(1)}
                  </Box>
                  <Box sx={{
                    bgcolor: exam.status === 'scheduled' ? '#3b82f6' :
                      exam.status === 'ongoing' ? '#10b981' :
                        exam.status === 'completed' ? '#6b7280' :
                          exam.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                    color: 'white',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </Box>
                </Box>

                <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem', paddingRight: '80px', marginBottom: '8px' }}>
                  {exam.exam_name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <SubjectIcon sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    {exam.subject}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <CalendarTodayIcon sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    {formatDate(exam.start_date)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <AccessTimeIcon sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    {getDuration(exam.duration_minutes)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <SchoolIcon sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    {exam.centers.length} Centers
                  </Typography>
                </Box>

                {exam.description && (
                  <Typography sx={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    {exam.description.length > 100 ? `${exam.description.substring(0, 100)}...` : exam.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>


      {exams.length > 0 && !showCreateForm && (
        <Button
          variant="contained"
          onClick={() => {
            setShowCreateForm(true);
            resetForm();
          }}
          sx={{
            backgroundColor: '#3b82f6',
            color: '#f1f5f9',
            marginBottom: '16px',
            '&:hover': { backgroundColor: '#2563eb' },
            alignSelf: 'flex-start'
          }}
        >
          Create New Exam
        </Button>
      )}

      {showCreateForm && (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            backgroundColor: '#1F2A40',
            padding: '24px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}
        >
          <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.25rem', gridColumn: '1 / -1' }}>
            {editMode ? 'Update Exam' : 'Create New Exam'}
          </Typography>

          <Box sx={formControlStyle}>
            <label style={labelStyle} htmlFor="exam_name">Exam Name *</label>
            <input
              id="exam_name"
              name="exam_name"
              value={formData.exam_name}
              onChange={handleChange}
              placeholder="Enter exam name"
              required
              style={inputStyle}
              disabled={loading}
            />
          </Box>

          <Box sx={formControlStyle}>
            <label style={labelStyle} htmlFor="exam_type">Exam Type *</label>
            <Select
              id="exam_type"
              name="exam_type"
              value={formData.exam_type}
              onChange={handleChange}
              required
              sx={selectStyle}
              disabled={loading}
            >
              {examTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
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
              onChange={handleChange}
              placeholder="Enter subject"
              required
              style={inputStyle}
              disabled={loading}
            />
          </Box>

          <Box sx={formControlStyle}>
            <label style={labelStyle} htmlFor="status">Status *</label>
            <Select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              sx={selectStyle}
              disabled={loading}
            >
              {examStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={formControlStyle}>
            <label style={labelStyle} htmlFor="start_date">Start Date & Time *</label>
            <input
              id="start_date"
              name="start_date"
              type="datetime-local"
              value={formData.start_date ?
                (formData.start_date instanceof Date
                  ? formData.start_date.toISOString().slice(0, 16)
                  : new Date(formData.start_date).toISOString().slice(0, 16)
                )
                : new Date().toISOString().slice(0, 16)
              }
              onChange={(e) => handleDateChange(e, 'start_date')}
              required
              style={inputStyle}
              disabled={loading}
            />
          </Box>

          <Box sx={formControlStyle}>
            <label style={labelStyle} htmlFor="end_date">End Date & Time *</label>
            <input
              id="end_date"
              name="end_date"
              type="datetime-local"
              value={formData.end_date ?
                (formData.end_date instanceof Date
                  ? formData.end_date.toISOString().slice(0, 16)
                  : new Date(formData.end_date).toISOString().slice(0, 16)
                )
                : new Date().toISOString().slice(0, 16)
              }
              onChange={(e) => handleDateChange(e, 'end_date')}
              required
              style={inputStyle}
              disabled={loading}
            />
          </Box>

          <Box sx={formControlStyle}>
            <label style={labelStyle} htmlFor="registration_deadline">Registration Deadline *</label>
            <input
              id="registration_deadline"
              name="registration_deadline"
              type="datetime-local"
              value={formData.registration_deadline ?
                (formData.registration_deadline instanceof Date
                  ? formData.registration_deadline.toISOString().slice(0, 16)
                  : new Date(formData.registration_deadline).toISOString().slice(0, 16)
                )
                : new Date().toISOString().slice(0, 16)
              }
              onChange={(e) => handleDateChange(e, 'registration_deadline')}
              required
              style={inputStyle}
              disabled={loading}
            />
          </Box>

          <Box sx={formControlStyle}>
            <label style={labelStyle} htmlFor="duration_minutes">Duration (minutes) *</label>
            <input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              value={formData.duration_minutes}
              onChange={handleChange}
              required
              style={inputStyle}
              disabled={loading}
            />
          </Box>

          <Box sx={formControlStyle}>
            <label style={labelStyle} htmlFor="max_score">Maximum Score *</label>
            <input
              id="max_score"
              name="max_score"
              type="number"
              value={formData.max_score}
              onChange={handleChange}
              required
              style={inputStyle}
              disabled={loading}
            />
          </Box>

          <Box sx={formControlStyle}>
            <label style={labelStyle} htmlFor="passing_score">Passing Score *</label>
            <input
              id="passing_score"
              name="passing_score"
              type="number"
              value={formData.passing_score}
              onChange={handleChange}
              required
              style={inputStyle}
              disabled={loading}
            />
          </Box>


          <FormControl sx={{ gridColumn: '1 / -1' }}>
            <InputLabel id="centers-label" sx={{ color: '#94a3b8' }}>Exam Centers *</InputLabel>
            <Select
              labelId="centers-label"
              id="centers"
              multiple
              value={formData.centers}
              onChange={(e) => handleMultiSelectChange(e, 'centers')}
              input={<OutlinedInput label="Exam Centers" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={getSchoolName(value)} sx={{ backgroundColor: '#334155', color: '#f1f5f9' }} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
              required
              sx={selectStyle}
              disabled={loading}
            >
              {schools.map((school) => (
                <MenuItem key={school.school_id} value={school.school_id}>
                  <Checkbox checked={formData.centers.indexOf(school.school_id) > -1} />
                  <ListItemText primary={school.name} secondary={school.school_id} />
                </MenuItem>
              ))}
            </Select>
            {formData.centers.length === 0 && (
              <FormHelperText sx={{ color: '#ef4444' }}>At least one center is required</FormHelperText>
            )}
          </FormControl>


          <FormControl sx={{ gridColumn: '1 / -1' }}>
            <InputLabel id="eligible-grades-label" sx={{ color: '#94a3b8' }}>Eligible Grades</InputLabel>
            <Select
              labelId="eligible-grades-label"
              id="eligible_grades"
              multiple
              value={formData.eligible_grades}
              onChange={(e) => handleMultiSelectChange(e, 'eligible_grades')}
              input={<OutlinedInput label="Eligible Grades" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={`Grade ${value}`} sx={{ backgroundColor: '#334155', color: '#f1f5f9' }} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
              sx={selectStyle}
              disabled={loading}
            >
              {gradeOptions.map((grade) => (
                <MenuItem key={grade} value={grade}>
                  <Checkbox checked={formData.eligible_grades.indexOf(grade) > -1} />
                  <ListItemText primary={`Grade ${grade}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>


          <Box sx={{ ...formControlStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle} htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter exam description"
              style={{
                ...inputStyle,
                height: '80px',
                resize: 'vertical'
              }}
              disabled={loading}
            />
          </Box>

          <Box sx={{ ...formControlStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle} htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Enter instructions for students"
              style={{
                ...inputStyle,
                height: '100px',
                resize: 'vertical'
              }}
              disabled={loading}
            />
          </Box>

          <Box sx={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end',
            marginTop: '24px',
            gridColumn: '1 / -1'
          }}>
            <Button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              sx={{
                backgroundColor: '#475569',
                color: '#f1f5f9',
                '&:hover': { backgroundColor: '#334155' }
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#3b82f6',
                color: '#f1f5f9',
                '&:hover': { backgroundColor: '#2563eb' }
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#f1f5f9' }} />
              ) : (
                editMode ? 'Update Exam' : 'Create Exam'
              )}
            </Button>



            <Dialog
              open={deleteConfirmOpen}
              onClose={() => setDeleteConfirmOpen(false)}
              PaperProps={{
                style: {
                  backgroundColor: '#1F2A40',
                  color: '#f1f5f9',
                },
              }}
            >
              <DialogTitle sx={{ color: '#f1f5f9' }}>
                Confirm Delete
              </DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ color: '#94a3b8' }}>
                  Are you sure you want to delete the exam "{examToDelete?.exam_name}"? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setDeleteConfirmOpen(false)}
                  sx={{ color: '#94a3b8' }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteExam}
                  sx={{ color: '#ef4444' }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#ef4444' }} /> : 'Delete'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box >
          </Box>
      )}
        </Box >
      );
};

      export default Exams;