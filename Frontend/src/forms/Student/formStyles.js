export const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '24px',
  backgroundColor: '#1e293b',
  color: '#f1f5f9',
  border: '1px solid #475569',
  borderRadius: '4px',
  fontSize: '14px',
  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
  },
  '&::placeholder': {
    color: '#94a3b8',
  }
};

export const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  color: '#f1f5f9',
  fontSize: '14px',
  fontWeight: 'bold'
};

export const formControlStyle = {
  marginBottom: '24px',
  '& .MuiFormLabel-root': {
    color: '#f1f5f9'
  },
  '& .MuiRadio-root': {
    color: '#3b82f6'
  },
  '& .Mui-checked': {
    color: '#3b82f6'
  }
};

export const selectStyle = {
  
    width: '100%',
    backgroundColor: '#1e293b', // Dark background color
    color: '#f1f5f9', // Light text color
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#475569', // Border color
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#64748b', // Hover border color
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3b82f6', // Focus border color
    },
    '& .MuiSelect-icon': {
      color: '#f1f5f9', // Icon color
    }
};