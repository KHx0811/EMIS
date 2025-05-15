import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Select, MenuItem, TextField, CircularProgress, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../Admin/Student/formStyles.js';

const url = import.meta.env.URL;


const SchoolFees = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fees, setFees] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentFeeId, setCurrentFeeId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);
  const [principalDetails, setPrincipalDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    grade: '',
    academicYear: '',
    feeType: 'Tuition',
    dueDate: '',
    feesAmount: '',
    installments: '1',
    description: ''
  });

  useEffect(() => {
    fetchFees();
    fetchPrincipalDetails();
  }, []);

  const fetchPrincipalDetails = async () => {
    try {
      const token = localStorage.getItem('principalToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      const response = await axios.get(`${url}/api/schools/details`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPrincipalDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching principal details:', error);
      setError('Failed to fetch principal details');
    }
  };

  const fetchFees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('principalToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      const response = await axios.get(`${url}/api/schools/fees`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setFees(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fees:', error);
      setError('Error fetching fee structures. Please try again.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      grade: '',
      academicYear: '',
      feeType: 'Tuition',
      dueDate: '',
      feesAmount: '',
      installments: '1',
      description: ''
    });
    setEditMode(false);
    setCurrentFeeId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.grade) {
      setError('Please select a grade.');
      return;
    }
    
    if (!formData.academicYear) {
      setError('Please enter academic year.');
      return;
    }
    
    if (!formData.feesAmount) {
      setError('Please enter fees amount.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('principalToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      const payload = { 
        grade: formData.grade,
        academicYear: formData.academicYear,
        feeType: formData.feeType,
        dueDate: formData.dueDate || null,
        feesAmount: parseFloat(formData.feesAmount),
        installments: parseInt(formData.installments),
        description: formData.description
      };

      if (editMode && currentFeeId) {
        await axios.put(`${url}/api/schools/fees/${currentFeeId}`, payload, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
        });
        setSuccess('Fee structure updated successfully');
      } else {
        await axios.post(`${url}/api/schools/fees/create-fees`, payload, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
        });
        setSuccess('Fee structure created successfully');
      }
      
      resetForm();
      setShowCreateForm(false);
      fetchFees();
    } catch (error) {
      console.error('Error with fee structure:', error);
      setError(`Error: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFeeClick = async (fee) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('principalToken');
      
      const response = await axios.get(`${url}/api/schools/fees/${fee._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const feeDetails = response.data.data;
      
      setFormData({
        grade: feeDetails.grade.toString(),
        academicYear: feeDetails.academicYear,
        feeType: feeDetails.feeType,
        dueDate: feeDetails.dueDate ? new Date(feeDetails.dueDate).toISOString().split('T')[0] : '',
        feesAmount: feeDetails.feesAmount.toString(),
        installments: feeDetails.installments.toString(),
        description: feeDetails.description || ''
      });
      
      setCurrentFeeId(fee._id);
      setEditMode(true);
      setShowCreateForm(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fee details:', error);
      setError('Error fetching fee details. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteClick = (e, fee) => {
    e.stopPropagation();
    setFeeToDelete(fee);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteFee = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('principalToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      await axios.delete(`${url}/api/schools/fees/${feeToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Fee structure deleted successfully!');
      setDeleteConfirmOpen(false);
      setFeeToDelete(null);
      fetchFees();
      
      if (editMode && currentFeeId === feeToDelete._id) {
        resetForm();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      setError(error.response?.data?.message || 'Error deleting fee structure. Please try again.');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const grades = Array.from({ length: 12 }, (_, i) => i + 1);
  const feeTypes = ['Tuition', 'Transportation', 'Examination', 'Laboratory', 'Library', 'Sports', 'Annual', 'Development', 'Other'];
  const installmentOptions = ['1', '2', '3', '4', '12'];

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
        Manage School Fees
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

      {loading && !showCreateForm ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </Box>
      ) : (
        <>
          <Box sx={{ marginBottom: '24px' }}>
            <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.25rem' }}>Fee Structures:</Typography>
            
            {fees.length > 0 ? (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '16px' 
              }}>
                {fees.map((fee) => (
                  <Box
                    key={fee._id}
                    sx={{
                      backgroundColor: '#1F2A40',
                      padding: '16px',
                      borderRadius: '8px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                      }
                    }}
                    onClick={() => handleFeeClick(fee)}
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
                      onClick={(e) => handleDeleteClick(e, fee)}
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
                    
                    <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem', paddingRight: '80px' }}>
                      {fee.feeType} - Grade {fee.grade}
                    </Typography>
                    <Typography sx={{ color: '#94a3b8' }}>Academic Year: {fee.academicYear}</Typography>
                    <Typography sx={{ color: '#94a3b8' }}>Amount: ₹{fee.feesAmount.toLocaleString()}</Typography>
                    <Typography sx={{ color: '#94a3b8' }}>Installments: {fee.installments}</Typography>
                    {fee.dueDate && (
                      <Typography sx={{ color: '#94a3b8' }}>
                        Due Date: {new Date(fee.dueDate).toLocaleDateString()}
                      </Typography>
                    )}
                    {fee.description && (
                      <Typography sx={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        {fee.description.length > 50 ? `${fee.description.substring(0, 50)}...` : fee.description}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ 
                backgroundColor: '#1F2A40', 
                padding: '24px', 
                borderRadius: '8px', 
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <Typography sx={{ color: '#f1f5f9', marginBottom: '16px' }}>
                  No fee structures found. Please create a new fee structure.
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
                  Create Fee Structure
                </Button>
              </Box>
            )}
          </Box>

          {fees.length > 0 && !showCreateForm && (
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
              Create Fee Structure
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
                marginBottom: '24px'
              }}
            >
              <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.25rem' }}>
                {editMode ? 'Update Fee Structure' : 'Create New Fee Structure'}
              </Typography>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="grade-select">Select Class *</label>
                <Select
                  id="grade-select"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                  sx={selectStyle}
                  disabled={loading}
                >
                  <MenuItem value="" disabled>
                    Select Class
                  </MenuItem>
                  {grades.map((grade) => (
                    <MenuItem key={grade} value={grade.toString()}>
                      {grade}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="academicYear">Academic Year *</label>
                <TextField
                  id="academicYear"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  placeholder="e.g., 2025-2026"
                  required
                  fullWidth
                  sx={{
                    input: { color: '#f1f5f9' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#475569' },
                      '&:hover fieldset': { borderColor: '#64748b' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                  disabled={loading}
                />
              </Box>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="fee-type">Fee Type *</label>
                <Select
                  id="fee-type"
                  name="feeType"
                  value={formData.feeType}
                  onChange={handleChange}
                  required
                  sx={selectStyle}
                  disabled={loading}
                >
                  {feeTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="feesAmount">Fee Amount (₹) *</label>
                <TextField
                  id="feesAmount"
                  name="feesAmount"
                  type="number"
                  inputProps={{ min: "0", step: "0.01" }}
                  value={formData.feesAmount}
                  onChange={handleChange}
                  placeholder="Enter amount in INR"
                  required
                  fullWidth
                  sx={{
                    input: { color: '#f1f5f9' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#475569' },
                      '&:hover fieldset': { borderColor: '#64748b' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                  disabled={loading}
                />
              </Box>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="installments">Number of Installments *</label>
                <Select
                  id="installments"
                  name="installments"
                  value={formData.installments}
                  onChange={handleChange}
                  required
                  sx={selectStyle}
                  disabled={loading}
                >
                  {installmentOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="dueDate">Due Date</label>
                <TextField
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    input: { color: '#f1f5f9' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#475569' },
                      '&:hover fieldset': { borderColor: '#64748b' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                  disabled={loading}
                />
              </Box>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="description">Description</label>
                <TextField
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter additional details about the fee"
                  multiline
                  rows={4}
                  fullWidth
                  sx={{
                    textarea: { color: '#f1f5f9' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#475569' },
                      '&:hover fieldset': { borderColor: '#64748b' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                    }
                  }}
                  disabled={loading}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#3b82f6',
                    color: '#f1f5f9',
                    '&:hover': { backgroundColor: '#2563eb' },
                    '&:disabled': { backgroundColor: '#64748b', color: '#cbd5e1' }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: '#f1f5f9' }} />
                  ) : (
                    editMode ? 'Update Fee Structure' : 'Create Fee Structure'
                  )}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                    setError('');
                    setSuccess('');
                  }}
                  sx={{
                    color: '#f1f5f9',
                    borderColor: '#475569',
                    '&:hover': { borderColor: '#64748b', backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          <Dialog
            open={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            PaperProps={{
              style: {
                backgroundColor: '#1F2A40',
                color: '#f1f5f9',
                border: '1px solid #475569',
              },
            }}
          >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ color: '#94a3b8' }}>
                Are you sure you want to delete the fee structure "{feeToDelete?.feeType} - Grade {feeToDelete?.grade}" 
                for academic year {feeToDelete?.academicYear}? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setDeleteConfirmOpen(false)} 
                sx={{ color: '#94a3b8' }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteFee} 
                sx={{ color: '#ef4444' }} 
                autoFocus
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default SchoolFees;