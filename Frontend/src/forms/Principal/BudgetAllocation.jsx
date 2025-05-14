import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Select, MenuItem, TextField, CircularProgress, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from '../Admin/Student/formStyles';
import config from '@/assets/config';

const { url } = config;

const BudgetUsage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [budgetUsageHistory, setBudgetUsageHistory] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showUsageForm, setShowUsageForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [usageToDelete, setUsageToDelete] = useState(null);
  const [budgetStats, setBudgetStats] = useState(null);

  const [formData, setFormData] = useState({
    budget_id: '',
    amount: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0],
    receipt_number: ''
  });

  useEffect(() => {
    fetchBudgets();
    fetchBudgetStats();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('principalToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      const response = await axios.get(`${url}/api/schools/budgets`, {
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
      const token = localStorage.getItem('principalToken');
      if (!token) {
        return;
      }

      const response = await axios.get(`${url}/api/schools/budget-stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBudgetStats(response.data.data || null);
    } catch (error) {
      console.error('Error fetching budget stats:', error);
    }
  };

  const fetchBudgetUsage = async (budgetId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('principalToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      const response = await axios.get(`${url}/api/schools/budgets/usage/${budgetId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBudgetUsageHistory(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budget usage:', error);
      setError('Error fetching budget usage history. Please try again.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      budget_id: selectedBudget ? selectedBudget._id : '',
      amount: '',
      purpose: '',
      date: new Date().toISOString().split('T')[0],
      receipt_number: ''
    });
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

    if (!formData.budget_id || !formData.amount || !formData.purpose) {
      setError('Budget, amount, and purpose are required.');
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
        budget_id: formData.budget_id,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        date: formData.date,
        receipt_number: formData.receipt_number || undefined
      };

      const response = await axios.post(`${url}/api/schools/budgets/usage`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      setBudgets(response.data.data);
      setSuccess('Budget usage recorded successfully');
      resetForm();
      setShowUsageForm(false);
      fetchBudgetUsage(formData.budget_id);
      fetchBudgetStats();
    } catch (error) {
      console.error('Error recording budget usage:', error);
      if (error.response && error.response.data && error.response.data.message) {
        if (error.response.data.available) {
          setError(`Insufficient funds. Available: ${formatCurrency(error.response.data.available)}, Requested: ${formatCurrency(error.response.data.requested)}`);
        } else {
          setError(`Error: ${error.response.data.message}`);
        }
      } else {
        setError('Error recording budget usage. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetClick = (budget) => {
    setSelectedBudget(budget);
    fetchBudgetUsage(budget._id);

    setFormData({
      ...formData,
      budget_id: budget._id
    });
  };

  const handleDeleteClick = (e, usage) => {
    e.stopPropagation();
    setUsageToDelete(usage);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteUsage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('principalToken');
      if (!token) {
        setError('You are not logged in. Please login to continue.');
        navigate('/login/principal');
        return;
      }

      const response = await axios.delete(`${url}/api/schools/budgets/usage/${usageToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBudgets(response.data.data);
      setSuccess('Budget usage record deleted successfully!');
      setDeleteConfirmOpen(false);
      setUsageToDelete(null);

      if (selectedBudget) {
        fetchBudgetUsage(selectedBudget._id);
      }

      fetchBudgetStats();
    } catch (error) {
      console.error('Error deleting budget usage:', error);
      setError(error.response?.data?.message || 'Error deleting budget usage. Please try again.');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

          {Object.keys(budgetStats.budgetsByCategory).length > 0 && (
            <Box sx={{ marginTop: '16px' }}>
              <Typography sx={{ color: '#f1f5f9', marginBottom: '8px', fontSize: '1rem' }}>
                Budget by Category
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                {Object.entries(budgetStats.budgetsByCategory).map(([category, data]) => (
                  <Box key={category} sx={{
                    backgroundColor: 'rgba(31, 41, 55, 0.5)',
                    padding: '12px',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${getBudgetCategoryColor(category)}`
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Typography sx={{ color: '#f1f5f9', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                        {category.replace('_', ' ')}
                      </Typography>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                        {(data.used / data.allocated * 100).toFixed(1)}% used
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        {formatCurrency(data.used)} of {formatCurrency(data.allocated)}
                      </Typography>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        Remaining: {formatCurrency(data.remaining)}
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', bgcolor: 'rgba(148, 163, 184, 0.2)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                      <Box
                        sx={{
                          height: '100%',
                          borderRadius: '999px',
                          bgcolor: (data.used / data.allocated) > 0.9 ? '#ef4444' :
                            (data.used / data.allocated) > 0.7 ? '#f59e0b' : '#10b981',
                          width: `${Math.min(100, (data.used / data.allocated) * 100)}%`,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Budget List and Selection */}
        <Box sx={{ flex: '1 1 300px' }}>
          <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.25rem' }}>Available Budgets</Typography>

          {loading && !budgets.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress sx={{ color: '#3b82f6' }} />
            </Box>
          ) : budgets.length > 0 ? (
            <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
              {budgets.map((budget) => (
                <Box
                  key={budget._id}
                  sx={{
                    backgroundColor: selectedBudget && selectedBudget._id === budget._id ? '#2D3748' : '#1F2A40',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    borderLeft: `4px solid ${getBudgetCategoryColor(budget.category)}`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }
                  }}
                  onClick={() => handleBudgetClick(budget)}
                >
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

                  <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>
                    {formatCurrency(budget.amount)}
                  </Typography>

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
                      {budget.description.length > 80 ? `${budget.description.substring(0, 80)}...` : budget.description}
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
              textAlign: 'center'
            }}>
              <Typography sx={{ color: '#f1f5f9' }}>
                No budget allocations found for your school.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Budget Usage and Form */}
        <Box sx={{ flex: '1 1 400px' }}>
          {selectedBudget ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Typography sx={{ color: '#f1f5f9', fontSize: '1.25rem' }}>
                  Budget Usage History
                </Typography>

                <Button
                  variant="contained"
                  onClick={() => {
                    setShowUsageForm(true);
                    resetForm();
                  }}
                  disabled={selectedBudget.status === 'depleted' || selectedBudget.status === 'closed'}
                  sx={{
                    backgroundColor: '#3b82f6',
                    color: '#f1f5f9',
                    '&:hover': { backgroundColor: '#2563eb' },
                    '&:disabled': { backgroundColor: '#64748b', color: '#cbd5e1' }
                  }}
                >
                  Record Usage
                </Button>
              </Box>

              {showUsageForm && (
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
                  <Typography sx={{ color: '#f1f5f9', marginBottom: '16px', fontSize: '1.1rem' }}>
                    Record Budget Usage
                  </Typography>

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
                        min="0.01"
                        max={selectedBudget.remaining}
                        step="0.01"
                        style={inputStyle}
                        disabled={loading}
                      />
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>
                        Available: {formatCurrency(selectedBudget.remaining)}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <label style={labelStyle} htmlFor="date">Date *</label>
                      <input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        disabled={loading}
                      />
                    </Box>
                  </Box>

                  <Box sx={formControlStyle}>
                    <label style={labelStyle} htmlFor="receipt_number">Receipt Number (optional)</label>
                    <input
                      id="receipt_number"
                      name="receipt_number"
                      type="text"
                      value={formData.receipt_number}
                      onChange={handleChange}
                      placeholder="Enter receipt number if available"
                      style={inputStyle}
                      disabled={loading}
                    />
                  </Box>

                  <Box sx={formControlStyle}>
                    <label style={labelStyle} htmlFor="purpose">Purpose *</label>
                    <textarea
                      id="purpose"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      placeholder="Describe the purpose of this expenditure"
                      rows={3}
                      required
                      style={{
                        ...inputStyle,
                        minHeight: '80px',
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
                        'Record Usage'
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowUsageForm(false);
                        resetForm();
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

              {loading && !budgetUsageHistory.length ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                  <CircularProgress sx={{ color: '#3b82f6' }} />
                </Box>
              ) : budgetUsageHistory.length > 0 ? (
                <Box sx={{
                  backgroundColor: '#1F2A40',
                  borderRadius: '8px',
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  {budgetUsageHistory.map((usage) => (
                    <Box
                      key={usage._id}
                      sx={{
                        borderBottom: '1px solid #2D3748',
                        padding: '16px',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >


                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {formatCurrency(usage.amount)}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CalendarTodayIcon sx={{ color: '#94a3b8', fontSize: '0.9rem' }} />
                          <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            {formatDate(usage.date)}
                          </Typography>
                          <DeleteIcon
                            sx={{
                              color: '#ef4444',
                              cursor: 'pointer',
                              '&:hover': { color: '#b91c1c' }
                            }}
                            onClick={(e) => handleDeleteClick(e, usage)}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ marginBottom: '8px' }}>
                        <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>
                          Purpose:
                        </Typography>
                        <Typography sx={{ color: '#f1f5f9', fontSize: '0.95rem' }}>
                          {usage.purpose}
                        </Typography>
                      </Box>

                      {usage.receipt_number && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                          <ReceiptIcon sx={{ color: '#94a3b8', fontSize: '0.9rem' }} />
                          <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            Receipt #: {usage.receipt_number}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{
                  backgroundColor: '#1F2A40',
                  padding: '24px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <Typography sx={{ color: '#f1f5f9' }}>
                    No usage records found for this budget.
                  </Typography>
                  {selectedBudget.status !== 'depleted' && selectedBudget.status !== 'closed' && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        setShowUsageForm(true);
                        resetForm();
                      }}
                      sx={{
                        backgroundColor: '#3b82f6',
                        color: '#f1f5f9',
                        marginTop: '16px',
                        '&:hover': { backgroundColor: '#2563eb' }
                      }}
                    >
                      Record First Usage
                    </Button>
                  )}
                </Box>
              )}
            </>
          ) : (
            <Box sx={{
              backgroundColor: '#1F2A40',
              padding: '24px',
              borderRadius: '8px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px'
            }}>
              <Typography sx={{ color: '#f1f5f9', marginBottom: '16px' }}>
                Select a budget from the list to view its usage history.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: '#1F2A40',
            color: '#f1f5f9',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            borderRadius: '8px'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #2D3748' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ marginTop: '16px' }}>
          <DialogContentText sx={{ color: '#f1f5f9' }}>
            Are you sure you want to delete this budget usage record? This action cannot be undone.
          </DialogContentText>
          {usageToDelete && (
            <Box sx={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
              <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>
                {formatCurrency(usageToDelete.amount)}
              </Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '4px' }}>
                Purpose: {usageToDelete.purpose}
              </Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Date: {formatDate(usageToDelete.date)}
              </Typography>
              {usageToDelete.receipt_number && (
                <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
                  Receipt #: {usageToDelete.receipt_number}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              color: '#f1f5f9',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUsage}
            sx={{
              backgroundColor: '#ef4444',
              color: '#f1f5f9',
              '&:hover': { backgroundColor: '#b91c1c' }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#f1f5f9' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetUsage;