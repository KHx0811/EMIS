import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Select, MenuItem, TextField, CircularProgress, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../Admin/Student/formStyles';

const url = import.meta.env.VITE_API_URL;

const Budgets = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [budgetStats, setBudgetStats] = useState(null);
  
  const [formData, setFormData] = useState({
    school_id: '',
    amount: '',
    fiscal_year: new Date().getFullYear(),
    category: 'general',
    description: '',
    status: 'allocated'
  });

  const budgetCategories = [
    'general',
    'infrastructure',
    'technology',
    'sports',
    'academics',
    'staff_development',
    'maintenance',
    'other'
  ];

  const budgetStatuses = [
    'allocated',
    'in_use',
    'depleted',
    'closed'
  ];

  useEffect(() => {
    fetchSchools();
    fetchBudgets();
    fetchBudgetStats();
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

      console.log('Fetching schools with token:', token.substring(0, 10) + '...');

      const response = await axios.get(`${url}/api/districts/schools`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Schools API response:', response.data);

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

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('districtToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/district');
        return;
      }

      const response = await axios.get(`${url}/api/districts/budgets`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBudgets(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setError('Error fetching budgets. Please try again.');
      setLoading(false);
    }
  };

  const fetchBudgetStats = async () => {
    try {
      const token = localStorage.getItem('districtToken');
      if (!token) {
        return;
      }

      const response = await axios.get(`${url}/api/districts/budget-stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBudgetStats(response.data.data || null);
    } catch (error) {
      console.error('Error fetching budget stats:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      school_id: '',
      amount: '',
      fiscal_year: new Date().getFullYear(),
      category: 'general',
      description: '',
      status: 'allocated'
    });
    setEditMode(false);
    setCurrentBudgetId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.school_id || !formData.amount) {
      setError('School and amount are required.');
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

      const payload = { 
        school_id: formData.school_id,
        amount: parseFloat(formData.amount),
        fiscal_year: formData.fiscal_year,
        category: formData.category,
        description: formData.description,
        status: formData.status
      };

      if (editMode && currentBudgetId) {
        await axios.put(`${url}/api/districts/budgets/${currentBudgetId}`, payload, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
        });
        setSuccess('Budget updated successfully');
      } else {
        await axios.post(`${url}/api/districts/budgets`, payload, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
        });
        setSuccess('Budget allocated successfully');
      }
      
      resetForm();
      setShowCreateForm(false);
      fetchBudgets();
      fetchBudgetStats();
    } catch (error) {
      console.error('Error with budget:', error);
      setError(`Error: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetClick = (budget) => {
    setFormData({
      school_id: budget.school_id,
      amount: budget.amount,
      fiscal_year: budget.fiscal_year,
      category: budget.category,
      description: budget.description || '',
      status: budget.status
    });
    
    setCurrentBudgetId(budget._id);
    setEditMode(true);
    setShowCreateForm(true);
  };

  const handleDeleteClick = (e, budget) => {
    e.stopPropagation();
    setBudgetToDelete(budget);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteBudget = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('districtToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/district');
        return;
      }

      await axios.delete(`${url}/api/districts/budgets/${budgetToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Budget deleted successfully!');
      setDeleteConfirmOpen(false);
      setBudgetToDelete(null);
      fetchBudgets();
      fetchBudgetStats();
      
      if (editMode && currentBudgetId === budgetToDelete._id) {
        resetForm();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      setError(error.response?.data?.message || 'Error deleting budget. Please try again.');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const getBudgetStatusClass = (status) => {
    switch (status) {
      case 'allocated': return 'bg-blue-100 text-blue-800';
      case 'in_use': return 'bg-yellow-100 text-yellow-800';
      case 'depleted': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getBudgetCategoryColor = (category) => {
    const colors = {
      'general': '#3b82f6',
      'infrastructure': '#8b5cf6',
      'technology': '#10b981',
      'sports': '#f59e0b',
      'academics': '#ef4444',
      'staff_development': '#6366f1',
      'maintenance': '#ec4899',
      'other': '#64748b'
    };
    return colors[category] || colors['other'];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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
        School Budget Management
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

      {budgetStats && (
        <Box sx={{
          backgroundColor: '#1F2A40',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.25rem' }}>
            Budget Overview
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Box sx={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Allocated</Typography>
              <Typography sx={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {formatCurrency(budgetStats.totalAllocated)}
              </Typography>
            </Box>
            
            <Box sx={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Used</Typography>
              <Typography sx={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {formatCurrency(budgetStats.totalUsed)}
              </Typography>
            </Box>
            
            <Box sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Remaining Budget</Typography>
              <Typography sx={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {formatCurrency(budgetStats.remainingBudget)}
              </Typography>
            </Box>
            
            <Box sx={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>Usage Percentage</Typography>
              <Typography sx={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {budgetStats.usagePercentage.toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {loading && !showCreateForm ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </Box>
      ) : (
        <>
          <Box sx={{ marginBottom: '24px' }}>
            <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.25rem' }}>Budget Allocations:</Typography>
            
            {budgets.length > 0 ? (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '16px' 
              }}>
                {budgets.map((budget) => (
                  <Box
                    key={budget._id}
                    sx={{
                      backgroundColor: '#1F2A40',
                      padding: '16px',
                      borderRadius: '8px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      borderLeft: `4px solid ${getBudgetCategoryColor(budget.category)}`,
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                      }
                    }}
                    onClick={() => handleBudgetClick(budget)}
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
                      onClick={(e) => handleDeleteClick(e, budget)}
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
                        bgcolor: getBudgetCategoryColor(budget.category),
                        color: 'white',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
                        {budget.category.replace('_', ' ')}
                      </Box>
                      
                      <Box sx={{ 
                        bgcolor: 'rgba(0,0,0,0.2)',
                        color: '#94a3b8',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        FY {budget.fiscal_year}
                      </Box>
                    </Box>

                    <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem', paddingRight: '80px', marginBottom: '8px' }}>
                      {formatCurrency(budget.amount)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <SchoolIcon sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        {getSchoolName(budget.school_id)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className={`px-2 py-1 text-xs rounded-full ${getBudgetStatusClass(budget.status)}`} style={{ textTransform: 'uppercase' }}>
                          {budget.status.replace('_', ' ')}
                        </span>
                      </Box>
                    </Box>

                    <Box sx={{ marginTop: '8px' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                          Usage
                        </Typography>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                          {formatCurrency(budget.usage || 0)} of {formatCurrency(budget.amount)} 
                          ({Math.round((budget.usage / budget.amount) * 100 || 0)}%)
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', bgcolor: 'rgba(148, 163, 184, 0.2)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                        <Box 
                          sx={{ 
                            height: '100%', 
                            borderRadius: '999px',
                            bgcolor: (budget.usage / budget.amount) > 0.9 ? '#ef4444' : 
                                    (budget.usage / budget.amount) > 0.7 ? '#f59e0b' : '#10b981',
                            width: `${Math.min(100, ((budget.usage || 0) / budget.amount) * 100)}%`,
                          }}
                        />
                      </Box>
                    </Box>

                    {budget.description && (
                      <Typography sx={{ color: '#94a3b8', marginTop: '8px', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        {budget.description.length > 100 ? `${budget.description.substring(0, 100)}...` : budget.description}
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
                  No budget allocations found. Create a new budget allocation.
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
                  Allocate Budget
                </Button>
              </Box>
            )}
          </Box>

          {budgets.length > 0 && !showCreateForm && (
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
              Allocate New Budget
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
                {editMode ? 'Update Budget Allocation' : 'Allocate New Budget'}
              </Typography>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="school_id">School *</label>
                <Select
                  id="school_id"
                  name="school_id"
                  value={formData.school_id}
                  onChange={handleChange}
                  required
                  sx={selectStyle}
                  disabled={loading}
                >
                  <MenuItem value="" disabled>
                    Select School
                  </MenuItem> 
                  {schools.map((school) => (
                    <MenuItem key={school._id} value={school.school_id}>
                      {school.school_name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box sx={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Box sx={{ flex: 1 }}>
                  <label style={labelStyle} htmlFor="amount">Amount ($) *</label>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    required
                    min="0"
                    step="0.01"
                    style={inputStyle}
                    disabled={loading}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <label style={labelStyle} htmlFor="fiscal_year">Fiscal Year *</label>
                  <input
                    id="fiscal_year"
                    name="fiscal_year"
                    type="number"
                    value={formData.fiscal_year}
                    onChange={handleChange}
                    min="2000"
                    max="2100"
                    required
                    style={inputStyle}
                    disabled={loading}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Box sx={{ flex: 1 }}>
                  <label style={labelStyle} htmlFor="category">Category *</label>
                  <Select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    sx={selectStyle}
                    disabled={loading}
                  >
                    {budgetCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box sx={{ flex: 1 }}>
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
                    {budgetStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Box>

              <Box sx={formControlStyle}>
                <label style={labelStyle} htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter budget description or purpose"
                  rows={4}
                  style={{
                    ...inputStyle,
                    minHeight: '100px',
                    resize: 'vertical'
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
                    editMode ? 'Update Budget' : 'Allocate Budget'
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
                Are you sure you want to delete the budget allocation of {budgetToDelete ? formatCurrency(budgetToDelete.amount) : ''} 
                for {budgetToDelete ? getSchoolName(budgetToDelete.school_id) : ''}? 
                This action cannot be undone.
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
                onClick={handleDeleteBudget} 
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

export default Budgets;