import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, Chip, Divider,
  Modal, TextField, FormControl, Select, MenuItem,
  InputLabel, Grid, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle,labelStyle } from '../Admin/Student/formStyles';

const statusColors = {
  Pending: '#f59e0b',
  Approved: '#22c55e',
  Rejected: '#ef4444'
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays === 1 ? '1 day' : `${diffDays} days`;
};

const LeaveApprovals = () => {
  const navigate = useNavigate();
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchLeaveApplications();
  }, []);

  const fetchLeaveApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('principalToken');
      if (!token) {
        navigate('/login/principal');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/schools/leave-applications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setLeaveApplications(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      setError('Failed to load leave applications. Please try again later.');
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem('principalToken');
        navigate('/login/principal');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (leave) => {
    setSelectedLeave(leave);
    setFormData({
      status: leave.status,
      remarks: leave.remarks || ''
    });
    setOpenModal(true);
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
      const token = localStorage.getItem('principalToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      const response = await axios.put(
        `http://localhost:3000/api/schools/leave-applications/${selectedLeave.applicationId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setLeaveApplications(response.data.data || []);
      setSuccess(`Leave application ${formData.status.toLowerCase()} successfully`);
      setOpenModal(false);

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating leave application:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('principalToken');
          navigate('/login/principal');
        } else {
          setError(`Error updating leave application: ${error.response.data.message || 'Please try again.'}`);
        }
      } else {
        setError('Error updating leave application. Please check your network connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredApplications = filterStatus === 'All'
    ? leaveApplications
    : leaveApplications.filter(leave => leave.status === filterStatus);

  return (
    <Box sx={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #475569', paddingBottom: '16px' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ color: '#f1f5f9' }}
        >
          Teacher Leave Applications
        </Typography>
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              color: '#f1f5f9',
              '& fieldset': {
                borderColor: '#475569',
              },
              '&:hover fieldset': {
                borderColor: '#94a3b8',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#94a3b8',
            },
            '& .MuiSelect-icon': {
              color: '#94a3b8',
            }
          }}
        >
          <InputLabel id="filter-status-label">Filter Status</InputLabel>
          <Select
            labelId="filter-status-label"
            id="filter-status"
            value={filterStatus}
            label="Filter Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {success && (
        <Alert severity="success" sx={{ marginBottom: 2, backgroundColor: '#042f2e', color: '#ecfdf5', border: '1px solid #065f46' }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2, backgroundColor: '#7f1d1d', color: '#fef2f2', border: '1px solid #dc2626' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </Box>
      ) : filteredApplications.length === 0 ? (
        <Typography sx={{ color: '#f1f5f9', textAlign: 'center', padding: '40px' }}>
          No leave applications found with {filterStatus === 'All' ? 'any' : `"${filterStatus}"`} status.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredApplications.map((leave) => (
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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {leave.teacherName || 'Unknown Teacher'}
                    </Typography>
                    <Chip
                      label={leave.status}
                      size="small"
                      sx={{
                        backgroundColor: statusColors[leave.status],
                        color: '#ffffff',
                        fontWeight: 'bold',
                        marginLeft: '12px'
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '4px' }}>
                    {leave.teacherSubject && `Subject: ${leave.teacherSubject}`}
                    {leave.teacherEmail && ` • ${leave.teacherEmail}`}
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                    <strong>Leave Period:</strong> {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    ({calculateDuration(leave.startDate, leave.endDate)})
                  </Typography>
                  <Divider sx={{ my: 1, backgroundColor: '#475569' }} />
                  <Typography sx={{ marginTop: '8px' }}>
                    <strong>Reason:</strong> {leave.reason}
                  </Typography>
                  {leave.remarks && (
                    <Typography sx={{ marginTop: '8px', fontStyle: 'italic', fontSize: '0.9rem' }}>
                      <strong>Remarks:</strong> {leave.remarks}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: { xs: 'left', sm: 'right' } }}>
                    Applied on {formatDate(leave.appliedDate)}
                  </Typography>
                  <Box sx={{ marginTop: '16px', display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenModal(leave)}
                      sx={{
                        color: leave.status === 'Pending' ? '#3b82f6' : '#94a3b8',
                        borderColor: leave.status === 'Pending' ? '#3b82f6' : '#475569',
                        '&:hover': {
                          backgroundColor: leave.status === 'Pending' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                          borderColor: leave.status === 'Pending' ? '#60a5fa' : '#64748b'
                        }
                      }}
                    >
                      {leave.status === 'Pending' ? 'Review' : 'View Details'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      )}

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="leave-review-modal"
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
          {selectedLeave && (
            <>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  color: '#f1f5f9',
                  marginBottom: '16px',
                  borderBottom: '1px solid #475569',
                  paddingBottom: '16px'
                }}
              >
                {selectedLeave.status === 'Pending' ? 'Review Leave Application' : 'Leave Application Details'}
              </Typography>

              <Box sx={{ marginBottom: '20px' }}>
                <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold' }}>
                  {selectedLeave.teacherName || 'Unknown Teacher'}
                  {selectedLeave.teacherSubject && ` • ${selectedLeave.teacherSubject}`}
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  {selectedLeave.teacherEmail}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                  <Typography sx={{ color: '#f1f5f9', marginRight: '10px' }}>
                    Current Status:
                  </Typography>
                  <Chip
                    label={selectedLeave.status}
                    size="small"
                    sx={{
                      backgroundColor: statusColors[selectedLeave.status],
                      color: '#ffffff',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ marginBottom: '16px' }}>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Leave Period</Typography>
                <Typography sx={{ color: '#f1f5f9' }}>
                  {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                  Duration: {calculateDuration(selectedLeave.startDate, selectedLeave.endDate)}
                </Typography>
              </Box>

              <Box sx={{ marginBottom: '16px' }}>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Reason</Typography>
                <Typography sx={{ color: '#f1f5f9', backgroundColor: '#1e293b', padding: '8px', borderRadius: '4px' }}>
                  {selectedLeave.reason}
                </Typography>
              </Box>

              <Divider sx={{ my: 2, backgroundColor: '#475569' }} />

              <FormControl
                fullWidth
                sx={{
                  marginBottom: '16px',
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': {
                      borderColor: '#475569',
                    },
                    '&:hover fieldset': {
                      borderColor: '#94a3b8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  },
                  '& .MuiSelect-icon': {
                    color: '#94a3b8',
                  }
                }}
              >
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  disabled={selectedLeave.status !== 'Pending' && !isSubmitting}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Remarks"
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                multiline
                rows={4}
                disabled={selectedLeave.status !== 'Pending' && !isSubmitting}
                sx={{
                  marginBottom: '20px',
                  '& .MuiOutlinedInput-root': {
                    color: '#f1f5f9',
                    '& fieldset': {
                      borderColor: '#475569',
                    },
                    '&:hover fieldset': {
                      borderColor: '#94a3b8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#94a3b8',
                  }
                }}
              />

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
                {selectedLeave.status === 'Pending' && (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      backgroundColor: formData.status === 'Approved' ? '#22c55e' :
                        formData.status === 'Rejected' ? '#ef4444' : '#3b82f6',
                      color: '#f1f5f9',
                      padding: '8px 16px',
                      '&:hover': {
                        backgroundColor: formData.status === 'Approved' ? '#16a34a' :
                          formData.status === 'Rejected' ? '#dc2626' : '#2563eb',
                      },
                      '&:disabled': {
                        backgroundColor: '#64748b',
                        color: '#e2e8f0'
                      }
                    }}
                  >
                    {isSubmitting ? 'Submitting...' :
                      formData.status === 'Approved' ? 'Approve Leave' :
                        formData.status === 'Rejected' ? 'Reject Leave' : 'Update Status'}
                  </Button>
                )}
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default LeaveApprovals;