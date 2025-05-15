import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, FormControl, Select, MenuItem, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle } from '../Admin/Student/formStyles.js';

const url = import.meta.env.URL;

const FeeDues = () => {
  const navigate = useNavigate();
  const [childDetails, setChildDetails] = useState(null);
  const [feeRecords, setFeeRecords] = useState([]);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [filteredFees, setFilteredFees] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feeType, setFeeType] = useState('');
  const [feeTypes, setFeeTypes] = useState([]);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalFees: 0,
    totalPaid: 0,
    balance: 0
  });

  useEffect(() => {
    fetchChildDetails();
  }, [navigate]);

  useEffect(() => {
    if (feeRecords.length > 0) {
      const uniqueFeeTypes = [...new Set(feeRecords.map(record => record.feeType))];
      setFeeTypes(uniqueFeeTypes);
      console.log('Fee types extracted:', uniqueFeeTypes);
    }
  }, [feeRecords]);

  const fetchChildDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('parentToken');
      
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/parent');
        return;
      }

      console.log('Fetching child details...');
      const response = await axios.get(`${url}/api/parents/child-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Child details response:', response.data);
      if (response.data.success && response.data.data) {
        setChildDetails(response.data.data);
        fetchFeeDetails(response.data.data.student_id);
      } else {
        setError('Failed to retrieve child details');
      }
    } catch (error) {
      console.error('Error fetching child details:', error);
      
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('parentToken');
        navigate('/login/parent');
      } else {
        setError(`Error fetching child details: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeDetails = async (studentId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('parentToken');
      
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/parent');
        return;
      }

      console.log(`Fetching fee details for student ID: ${studentId}`);
      const response = await axios.get(`${url}/api/parents/child-fee-details/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Fee details response:', response.data);
      
      if (response.data.success && response.data.data) {
        const { feeStructure, feePayments, summary } = response.data.data;
        
        if (Array.isArray(feeStructure)) {
          setFeeRecords(feeStructure);
          console.log(`Loaded ${feeStructure.length} fee structure records`);
        } else {
          console.warn('Fee structure is not an array or is empty:', feeStructure);
          setFeeRecords([]);
        }
        
        if (Array.isArray(feePayments)) {
          setPaymentRecords(feePayments);
          console.log(`Loaded ${feePayments.length} payment records`);
        } else {
          console.warn('Fee payments is not an array or is empty:', feePayments);
          setPaymentRecords([]);
        }
        
        if (summary) {
          setSummary(summary);
          console.log('Fee summary:', summary);
        } else {
          setSummary({
            totalFees: 0,
            totalPaid: 0,
            balance: 0
          });
        }
      } else {
        setError('Failed to retrieve fee details');
      }
    } catch (error) {
      console.error('Error fetching fee details:', error);
      setError(`Error fetching fee details: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFeeTypeChange = (e) => {
    setFeeType(e.target.value);
  };

  const handleSearch = () => {
    if (!feeType) {
      alert('Please select a fee type to filter.');
      return;
    }

    console.log(`Filtering fees by type: ${feeType}`);
    const filtered = feeRecords.filter(record => record.feeType === feeType);
    console.log(`Found ${filtered.length} matching records`);
    setFilteredFees(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString || 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    } catch (e) {
      console.error('Error formatting currency:', e);
      return `₹${amount}` || 'N/A';
    }
  };

  const calculateDaysUntilDue = (dueDateString) => {
    if (!dueDateString) return 0;
    try {
      const dueDate = new Date(dueDateString);
      const today = new Date();
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      console.error('Error calculating days until due:', e);
      return 0;
    }
  };

  const getDueStatusColor = (dueDateString) => {
    const daysUntilDue = calculateDaysUntilDue(dueDateString);
    if (daysUntilDue < 0) return '#ef4444';
    if (daysUntilDue < 7) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <Box
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
        Child Fee Details
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: '#7f1d1d', color: '#fee2e2' }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress sx={{ color: '#3b82f6' }} />
        </Box>
      )}

      {childDetails && (
        <Box sx={{ marginBottom: '24px' }}>
          <Typography variant="h5" sx={{ color: '#f1f5f9', marginBottom: '8px' }}>
            Student Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Typography sx={{ color: '#f1f5f9' }}>
              <strong>Student ID:</strong> {childDetails.student_id}
            </Typography>
            <Typography sx={{ color: '#f1f5f9' }}>
              <strong>Name:</strong> {childDetails.name}
            </Typography>
            <Typography sx={{ color: '#f1f5f9' }}>
              <strong>Class:</strong> {childDetails.className} - {childDetails.section}
            </Typography>
            <Typography sx={{ color: '#f1f5f9' }}>
              <strong>School ID:</strong> {childDetails.school_id}
            </Typography>
            <Typography sx={{ color: '#f1f5f9' }}>
              <strong>Academic Year:</strong> {childDetails.academicYear}
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ 
        marginBottom: '24px', 
        padding: '16px', 
        backgroundColor: '#1e293b', 
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <Box>
          <Typography variant="h6" sx={{ color: '#f1f5f9', marginBottom: '8px' }}>
            Fee Summary
          </Typography>
          <Typography sx={{ color: '#f1f5f9' }}>
            <strong>Total Fees:</strong> {formatCurrency(summary.totalFees)}
          </Typography>
          <Typography sx={{ color: '#f1f5f9' }}>
            <strong>Total Paid:</strong> {formatCurrency(summary.totalPaid)}
          </Typography>
          <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold' }}>
            <strong>Balance:</strong> {formatCurrency(summary.balance)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#3b82f6',
              color: '#f1f5f9',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
            onClick={() => alert('Payment feature coming soon!')}
          >
            Pay Fees
          </Button>
        </Box>
      </Box>

      {feeRecords.length > 0 && (
        <Box sx={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Box sx={formControlStyle}>
            <label htmlFor="feeType" style={labelStyle}>Fee Type</label>
            <FormControl fullWidth>
              <Select
                id="feeType"
                value={feeType}
                onChange={handleFeeTypeChange}
                displayEmpty
                sx={{
                  backgroundColor: '#1e293b',
                  color: '#f1f5f9',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#475569',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#64748b',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3b82f6',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#f1f5f9',
                  },
                }}
              >
                <MenuItem value="">
                  <em>Select Fee Type</em>
                </MenuItem>
                {feeTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Button
            onClick={handleSearch}
            variant="contained"
            sx={{
              backgroundColor: '#3b82f6',
              color: '#f1f5f9',
              padding: '8px 16px',
              height: '40px',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
          >
            Search
          </Button>
        </Box>
      )}

      {filteredFees && filteredFees.length > 0 ? (
        <Box sx={{ marginBottom: '24px', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
          <Typography variant="h6" sx={{ color: '#f1f5f9', marginBottom: '8px' }}>
            Search Results
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', color: '#f1f5f9', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #475569', padding: '8px' }}>Fee Type</th>
                  <th style={{ border: '1px solid #475569', padding: '8px' }}>Amount</th>
                  <th style={{ border: '1px solid #475569', padding: '8px' }}>Academic Year</th>
                  <th style={{ border: '1px solid #475569', padding: '8px' }}>Installments</th>
                  <th style={{ border: '1px solid #475569', padding: '8px' }}>Due Date</th>
                  <th style={{ border: '1px solid #475569', padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFees.map((record, index) => {
                  const dueStatus = calculateDaysUntilDue(record.dueDate);
                  const statusColor = getDueStatusColor(record.dueDate);
                  
                  return (
                    <tr key={index}>
                      <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.feeType || 'N/A'}</td>
                      <td style={{ border: '1px solid #475569', padding: '8px' }}>{formatCurrency(record.feesAmount)}</td>
                      <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.academicYear || 'N/A'}</td>
                      <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.installments || 'N/A'}</td>
                      <td style={{ border: '1px solid #475569', padding: '8px' }}>{formatDate(record.dueDate)}</td>
                      <td style={{ border: '1px solid #475569', padding: '8px', color: statusColor }}>
                        {dueStatus < 0 ? 'Overdue' : dueStatus < 7 ? 'Due Soon' : 'Not Due Yet'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </Box>
      ) : filteredFees && filteredFees.length === 0 ? (
        <Box sx={{ marginBottom: '24px', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
          <Typography sx={{ color: '#f1f5f9' }}>
            No fee records found for the selected criteria.
          </Typography>
        </Box>
      ) : null}

      <Typography variant="h5" sx={{ color: '#f1f5f9', marginBottom: '16px', marginTop: '16px' }}>
        Fee Structure
      </Typography>

      <Box sx={{ marginBottom: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', color: '#f1f5f9', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Fee Type</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Amount</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Academic Year</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Installments</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Due Date</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {feeRecords.length > 0 ? (
              feeRecords.map((record, index) => {
                const dueStatus = calculateDaysUntilDue(record.dueDate);
                const statusColor = getDueStatusColor(record.dueDate);
                
                return (
                  <tr key={index}>
                    <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.feeType || 'N/A'}</td>
                    <td style={{ border: '1px solid #475569', padding: '8px' }}>{formatCurrency(record.feesAmount)}</td>
                    <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.academicYear || 'N/A'}</td>
                    <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.installments || 'N/A'}</td>
                    <td style={{ border: '1px solid #475569', padding: '8px', color: statusColor }}>
                      {formatDate(record.dueDate)}
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        {dueStatus < 0 ? `${Math.abs(dueStatus)} days overdue` : 
                         dueStatus === 0 ? 'Due today' :
                         `${dueStatus} days remaining`}
                      </div>
                    </td>
                    <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.description || 'N/A'}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ border: '1px solid #475569', padding: '8px', textAlign: 'center' }}>
                  No fee records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>

      <Typography variant="h5" sx={{ color: '#f1f5f9', marginBottom: '16px', marginTop: '16px' }}>
        Payment History
      </Typography>

      <Box sx={{ marginBottom: '16px', overflowX: 'auto' }}>
        <table style={{ width: '100%', color: '#f1f5f9', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Receipt No.</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Fee Type</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Amount Paid</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Payment Method</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Transaction ID</th>
              <th style={{ border: '1px solid #475569', padding: '8px' }}>Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {paymentRecords.length > 0 ? (
              paymentRecords.map((record, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.receiptNumber || `RCPT-${index + 1}`}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.feeType || 'N/A'}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{formatCurrency(record.amountPaid)}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.paymentMethod || 'Online'}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{record.transactionId || '-'}</td>
                  <td style={{ border: '1px solid #475569', padding: '8px' }}>{formatDate(record.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ border: '1px solid #475569', padding: '8px', textAlign: 'center' }}>
                  No payment records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
      
      {feeRecords.length === 0 && !loading && (
        <Box sx={{ 
          padding: '16px', 
          backgroundColor: '#334155', 
          borderRadius: '8px',
          marginTop: '16px',
          marginBottom: '16px'
        }}>
          <Typography sx={{ color: '#f1f5f9', fontWeight: 'bold' }}>
            No fee records found. This might be due to:
          </Typography>
          <ul style={{ color: '#f1f5f9', marginTop: '8px' }}>
            <li>No fee structure has been set up for this student's grade/class</li>
            <li>The academic year in the student record doesn't match the fee structure</li>
            <li>The student's grade/class information might be incorrect</li>
          </ul>
          <Typography sx={{ color: '#f1f5f9', marginTop: '8px' }}>
            Please contact the school administration for assistance.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FeeDues;