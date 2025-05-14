import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, MenuItem, Radio, RadioGroup, FormControlLabel, Select, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { inputStyle, labelStyle, formControlStyle, selectStyle } from './formStyles';

const CreateStudentForm = ({ onSubmit = () => {} }) => {
  const navigate = useNavigate();
  const [generatedStudentId, setGeneratedStudentId] = useState('');
  const [generatedParentId, setGeneratedParentId] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState([]); // For storing fetched schools
  const [filteredSchools, setFilteredSchools] = useState([]); // For filtered schools based on education level
  
  const initialFormData = {
    name: '',
    gender: '',
    age: '',
    education_level: '',
    school: '',
    status: '',
    date_of_birth: '',
    date_of_admission: '',
    class: '',
    year: '',
    degree: '',
    specialization: '',
    religion: '',
    nationality: '',
    address: '',
    school_id: '',
    selectedSchoolId: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/schools', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Schools API response:", response.data);
      
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        setSchools(response.data.data);
      } else {
        console.error('Invalid school data format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('adminToken');
        navigate('/login/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.education_level && schools.length > 0) {
      let filtered;
      
      if (formData.education_level === 'secondary') {
        filtered = schools.filter(school => 
          school.education_level === 'secondary' || 
          school.education_level === 'all'
        );
      } else if (formData.education_level === 'graduation') {
        filtered = schools.filter(school => 
          school.education_level === 'graduation' || 
          school.education_level === 'all'
        );
      } else if (formData.education_level === 'post_graduation') {
        filtered = schools.filter(school => 
          school.education_level === 'post_graduation' || 
          school.education_level === 'all'
        );
      } else {
        filtered = [];
      }
      
      console.log("Filtered schools:", filtered);
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools([]);
    }
  }, [formData.education_level, schools]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'education_level') {
      setFormData({
        ...formData,
        education_level: value,
        class: '',
        year: '',
        degree: '',
        specialization: '',
        school: '',
        school_id: '',
        selectedSchoolId: ''
      });
    } else if (name === 'selectedSchoolId') {
      const selectedSchool = schools.find(school => school.school_id === value);
      console.log("Selected school:", selectedSchool);
      
      if (selectedSchool) {
        setFormData({
          ...formData,
          selectedSchoolId: value,
          school: selectedSchool.school_name,
          school_id: selectedSchool.school_id
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  useEffect(() => {
    validateDates();
  }, [formData.date_of_birth, formData.date_of_admission, formData.education_level, formData.status]);

  const validateDates = () => {
    const newErrors = {};
    const today = new Date();
    
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const ageInYears = calculateAge(birthDate);
      
      if (formData.status === 'active') {
        let minAgeRequired = 0;
        if (formData.education_level === 'secondary') minAgeRequired = 6;
        else if (formData.education_level === 'graduation') minAgeRequired = 18;
        else if (formData.education_level === 'post_graduation') minAgeRequired = 21;
        
        if (formData.education_level && ageInYears < minAgeRequired) {
          newErrors.date_of_birth = `Age must be at least ${minAgeRequired} years for ${formatEducationLevel(formData.education_level)}`;
        }
      }
    }
    
    if (formData.date_of_admission && formData.date_of_birth) {
      const admissionDate = new Date(formData.date_of_admission);
      const birthDate = new Date(formData.date_of_birth);
      
      if (admissionDate > today) {
        newErrors.date_of_admission = "Admission date cannot be in the future";
      } else {
        if (formData.status === 'dropout') {
          const ageAtAdmission = calculateYearsDifference(birthDate, admissionDate);
          if (ageAtAdmission < 18) {
            newErrors.date_of_admission = "For dropout students, admission date must be at least 18 years after date of birth";
          }
        } 
        else if (formData.status === 'active') {
          const yearsDiff = calculateYearsDifference(admissionDate, today);
          
          let maxYearsBack = 0;
          if (formData.education_level === 'secondary') maxYearsBack = 10;
          else if (formData.education_level === 'graduation') maxYearsBack = 4;
          else if (formData.education_level === 'post_graduation') maxYearsBack = 2;
          
          if (formData.education_level && yearsDiff > maxYearsBack) {
            newErrors.date_of_admission = `Admission date cannot be more than ${maxYearsBack} years ago for ${formatEducationLevel(formData.education_level)}`;
          }
        }
      }
    }
    
    if (formData.date_of_birth && formData.date_of_admission) {
      const birthDate = new Date(formData.date_of_birth);
      const admissionDate = new Date(formData.date_of_admission);
      
      if (admissionDate < birthDate) {
        newErrors.date_of_admission = "Admission date cannot be before date of birth";
      }
    }
    
    setErrors(newErrors);
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateYearsDifference = (earlier, later) => {
    let yearsDiff = later.getFullYear() - earlier.getFullYear();
    const monthDiff = later.getMonth() - earlier.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && later.getDate() < earlier.getDate())) {
      yearsDiff--;
    }
    
    return yearsDiff;
  };

  const formatEducationLevel = (level) => {
    switch (level) {
      case 'secondary': return 'Secondary Education';
      case 'graduation': return 'Graduation';
      case 'post_graduation': return 'Post Graduation';
      default: return level;
    }
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setGeneratedStudentId('');
    setGeneratedParentId('');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    validateDates();
    
    if (Object.keys(errors).filter(key => errors[key]).length > 0) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('You are not logged in. Please login to continue.');
        navigate('/login/admin');
        return;
      }

      const { selectedSchoolId, ...submissionData } = formData;
      
      const formattedData = {
        ...submissionData,
        date_of_birth: new Date(formData.date_of_birth).toISOString(),
        date_of_admission: new Date(formData.date_of_admission).toISOString(),
      };

      const response = await axios.post('http://localhost:3000/api/students', formattedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const createdStudent = response.data.data;
      console.log('Student created successfully:', createdStudent);
      setGeneratedStudentId(createdStudent.student_id);
      setGeneratedParentId(createdStudent.parent_id);
      onSubmit(createdStudent);
    } catch (error) {
      console.error('Error creating student:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/login/admin');
        } else {
          alert(`Error creating student: ${error.response.data.message || 'Please try again.'}`);
        }
      } else {
        alert('Error creating student. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getInstitutionLabel = () => {
    switch (formData.education_level) {
      case 'secondary': return 'School';
      case 'graduation': return 'College';
      case 'post_graduation': return 'University/College';
      default: return 'Institution';
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
          paddingBottom: '16px',
        }}
      >
        Create Student Form
      </Typography>

      {loading && (
        <Typography sx={{ color: '#38bdf8', marginBottom: '16px' }}>
          Loading...
        </Typography>
      )}

      {generatedStudentId && (
        <Typography
          variant="h6"
          sx={{
            color: '#22c55e',
            marginBottom: '16px',
          }}
        >
          Student created successfully!<br />
          Generated Student ID: {generatedStudentId}<br />
          {generatedParentId && `Generated Parent ID: ${generatedParentId}`}
        </Typography>
      )}

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="name">Name *</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="gender">Gender *</label>
        <Select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          sx={selectStyle}
          displayEmpty
        >
          <MenuItem value="" disabled>Select Gender</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
        </Select>
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="age">Age *</label>
        <input
          id="age"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </Box>

      <FormControl component="fieldset" sx={formControlStyle}>
        <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Education Level *</FormLabel>
        <RadioGroup row name="education_level" value={formData.education_level} onChange={handleChange}>
          <FormControlLabel value="secondary" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Secondary" />
          <FormControlLabel value="graduation" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Graduation" />
          <FormControlLabel value="post_graduation" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Post Graduation" />
        </RadioGroup>
      </FormControl>

      {formData.education_level && (
        <Box sx={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="selectedSchoolId">{getInstitutionLabel()} *</label>
          <Select
            id="selectedSchoolId"
            name="selectedSchoolId"
            value={formData.selectedSchoolId}
            onChange={handleChange}
            required
            sx={selectStyle}
            displayEmpty
          >
            <MenuItem value="" disabled>Select {getInstitutionLabel()}</MenuItem>
            {filteredSchools.length > 0 ? (
              filteredSchools.map((school) => (
                <MenuItem key={school.school_id} value={school.school_id}>
                  {school.school_name} ({school.school_id}) - District: {school.district_name || school.district_id}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                {loading ? "Loading schools..." : "No schools available"}
              </MenuItem>
            )}
          </Select>
          {filteredSchools.length === 0 && !loading && formData.education_level && (
            <Typography variant="caption" sx={{ color: '#f87171', marginTop: '4px', display: 'block' }}>
              No {getInstitutionLabel().toLowerCase()}s found for {formatEducationLevel(formData.education_level)}
            </Typography>
          )}
        </Box>
      )}

      {formData.education_level === 'graduation' && (
        <>
          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="degree">Degree *</label>
            <input
              id="degree"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>

          <Box sx={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="specialization">Specialization *</label>
            <input
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </Box>
        </>
      )}

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="school_id">School ID *</label>
        <input
          id="school_id"
          name="school_id"
          value={formData.school_id}
          onChange={handleChange}
          required
          readOnly
          style={{...inputStyle, backgroundColor: '#1e293b'}}
        />
        <Typography variant="caption" sx={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
          Auto-filled based on selected institution
        </Typography>
      </Box>

      <FormControl component="fieldset" sx={formControlStyle}>
        <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Status *</FormLabel>
        <RadioGroup row name="status" value={formData.status} onChange={handleChange}>
          <FormControlLabel value="active" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Active" />
          <FormControlLabel value="dropout" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Dropout" />
        </RadioGroup>
      </FormControl>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="date_of_birth">Date of Birth *</label>
        <input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          value={formData.date_of_birth}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        {errors.date_of_birth && (
          <Typography variant="caption" sx={{ color: '#ef4444', marginTop: '4px', display: 'block' }}>
            {errors.date_of_birth}
          </Typography>
        )}
      </Box>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="date_of_admission">Date of Admission *</label>
        <input
          id="date_of_admission"
          name="date_of_admission"
          type="date"
          value={formData.date_of_admission}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        {errors.date_of_admission && (
          <Typography variant="caption" sx={{ color: '#ef4444', marginTop: '4px', display: 'block' }}>
            {errors.date_of_admission}
          </Typography>
        )}
      </Box>

      {formData.education_level === 'secondary' && (
        <Box sx={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="class">Class *</label>
          <Select
            id="class"
            name="class"
            value={formData.class}
            onChange={handleChange}
            required
            sx={selectStyle}
            displayEmpty
          >
            <MenuItem value="" disabled>Select Class</MenuItem>
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
            ))}
          </Select>
        </Box>
      )}

      {(formData.education_level === 'graduation' || formData.education_level === 'post_graduation') && (
        <Box sx={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="year">Year *</label>
          <Select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            sx={selectStyle}
            displayEmpty
          >
            <MenuItem value="" disabled>Select Year</MenuItem>
            {(formData.education_level === 'graduation' 
              ? ['First Year', 'Second Year', 'Third Year', 'Fourth Year']
              : ['First Year', 'Second Year']
            ).map((year, index) => (
              <MenuItem key={index} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </Box>
      )}

      <FormControl component="fieldset" sx={formControlStyle}>
        <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Religion</FormLabel>
        <RadioGroup row name="religion" value={formData.religion} onChange={handleChange}>
          <FormControlLabel value="hindu" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Hindu" />
          <FormControlLabel value="christian" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Christian" />
          <FormControlLabel value="muslim" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Muslim" />
          <FormControlLabel value="others" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Others" />
        </RadioGroup>
      </FormControl>

      <FormControl component="fieldset" sx={formControlStyle}>
        <FormLabel component="legend" sx={{ color: '#f1f5f9' }}>Nationality</FormLabel>
        <RadioGroup row name="nationality" value={formData.nationality} onChange={handleChange}>
          <FormControlLabel value="indian" control={<Radio sx={{ color: '#f1f5f9' }} />} label="Indian" />
          <FormControlLabel value="nri" control={<Radio sx={{ color: '#f1f5f9' }} />} label="NRI" />
        </RadioGroup>
      </FormControl>

      <Box sx={{ marginBottom: '16px' }}>
        <label style={labelStyle} htmlFor="address">Address *</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          style={{...inputStyle, minHeight: '80px', resize: 'vertical'}}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          sx={{ 
            backgroundColor: '#3b82f6',
            color: '#f1f5f9',
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: '#2563eb',
            },
            '&:disabled': {
              backgroundColor: '#94a3b8',
            }
          }}
        >
          {loading ? 'Creating...' : 'Create Student Profile'}
        </Button>

        <Button 
          type="button" 
          variant="outlined" 
          onClick={handleClear}
          disabled={loading}
          sx={{ 
            borderColor: '#f87171',
            color: '#f87171',
            padding: '8px 16px',
            '&:hover': {
              borderColor: '#ef4444',
              color: '#ef4444',
            },
            '&:disabled': {
              borderColor: '#94a3b8',
              color: '#94a3b8',
            }
          }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
};

export default CreateStudentForm;