import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Chip, Divider, Modal } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle } from '../../forms/Admin/Student/formStyles';
import config from '@/assets/config';

const { url } = config;

const statusColors = {
  Pending: '#f59e0b', // Amber
  Approved: '#22c55e', // Green 
  Rejected: '#ef4444'  // Red
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const Leave = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchLeaveApplications();
  }, []);

  const fetchLeaveApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        navigate('/login/teacher');
        return;
      }

      const response = await axios.get(`${url}/api/teachers/leave-applications`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setLeaveApplications(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      setError('Failed to load leave applications. Please try again later.');
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('teacherToken');
        navigate('/login/teacher');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('teacherToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/teacher');
        return;
      }

      const response = await axios.post(`${url}/api/teachers/apply-leave`,formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setLeaveApplications(response.data.data || []);
      alert('Leave application submitted successfully');
      
      setFormData({
        startDate: '',
        endDate: '',
        reason: ''
      });
      setOpenModal(false);
    } catch (error) {
      console.error('Error submitting leave application:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('teacherToken');
          navigate('/login/teacher');
        } else {
          alert(`Error submitting leave application: ${error.response.data.message || 'Please try again.'}`);
        }
      } else {
        alert('Error submitting leave application. Please check your network connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateDates = () => {
    if (!formData.startDate || !formData.endDate) return true;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return start <= end;
  };

  const isFormValid = formData.startDate && formData.endDate && formData.reason && validateDates();

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };

  return (
    <Box sx={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #475569', paddingBottom: '16px' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ color: '#f1f5f9' }}
        >
          Leave Applications
        </Typography>
        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
          sx={{
            backgroundColor: '#3b82f6',
            color: '#f1f5f9',
            '&:hover': {
              backgroundColor: '#2563eb',
            }
          }}
        >
          Apply for Leave
        </Button>
      </Box>

      {loading ? (
        <Typography sx={{ color: '#f1f5f9', textAlign: 'center', padding: '20px' }}>Loading leave applications...</Typography>
      ) : error ? (
        <Typography sx={{ color: '#f97171', textAlign: 'center', padding: '20px' }}>{error}</Typography>
      ) : leaveApplications.length === 0 ? (
        <Typography sx={{ color: '#f1f5f9', textAlign: 'center', padding: '20px' }}>No leave applications found. Apply for your first leave!</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {leaveApplications.map((leave) => (
            <Paper 
              key={leave._id} 
              elevation={2} 
              sx={{ 
                padding: '16px', 
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                </Typography>
                <Chip 
                  label={leave.status} 
                  sx={{ 
                    backgroundColor: statusColors[leave.status],
                    color: '#ffffff',
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
              <Typography sx={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                <strong>Duration:</strong> {calculateDuration(leave.startDate, leave.endDate)}
              </Typography>
              <Divider sx={{ my: 1, backgroundColor: '#475569' }} />
              <Typography sx={{ marginTop: '8px' }}>
                <strong>Reason:</strong> {leave.reason}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '8px' }}>
                Applied on {formatDate(leave.appliedDate)}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="apply-leave-modal"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0f172a',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              color: '#f1f5f9',
              marginBottom: '24px',
              borderBottom: '1px solid #475569',
              paddingBottom: '16px'
            }}
          >
            Apply for Leave
          </Typography>
          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="startDate">Start Date *</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>
          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="endDate">End Date *</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            {formData.startDate && formData.endDate && !validateDates() && (
              <Typography variant="caption" sx={{ color: 'red', display: 'block', marginTop: '4px' }}>
                End date must be after or same as start date
              </Typography>
            )}
          </Box>
          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="reason">Reason *</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <Button
              onClick={() => setOpenModal(false)}
              sx={{
                backgroundColor: 'transparent',
                color: '#f1f5f9',
                border: '1px solid #475569',
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: '#1e293b',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!isFormValid || isSubmitting}
              sx={{
                backgroundColor: '#3b82f6',
                color: '#f1f5f9',
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
                '&:disabled': {
                  backgroundColor: '#64748b',
                  color: '#e2e8f0'
                }
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Leave Application'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Leave;