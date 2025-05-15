import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const url = import.meta.env.URL;

const TeacherSearch = () => {
    const [searchParams, setSearchParams] = useState({ teacherId: '' });
    const [teacherData, setTeacherData] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchParams({ ...searchParams, [name]: value });
    };

    const handleSearch = async () => {
        try {
            const token = localStorage.getItem('districtToken');
            if (!token) {
                throw new Error('No token found');
            }

            const { teacherId } = searchParams;
            console.log('Teacher ID being sent:', teacherId);

            if (!teacherId) {
                setError('Please enter a valid Teacher ID');
                return;
            }

            const response = await axios.get(`${url}/api/districts/search-teacher/${teacherId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setTeacherData(response.data.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching teacher data:', error);
            setError(error.response?.data?.message || 'Error fetching teacher data');
        }
    };

    return (
        <Box sx={{ padding: '24px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
            <Typography variant="h3" sx={{ color: '#f1f5f9', marginBottom: '16px' }}>
                Search Teacher
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TextField
                    label="Teacher ID"
                    name="teacherId"
                    value={searchParams.teacherId}
                    onChange={handleChange}
                    fullWidth
                    variant="filled"
                    sx={{ backgroundColor: '#1F2A40', color: '#e0e0e0' }}
                />
                <Button
                    variant="contained"
                    onClick={handleSearch}
                    sx={{ backgroundColor: '#3b82f6', color: '#f1f5f9' }}
                >
                    Search
                </Button>
            </Box>

            {error && (
                <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
                    <Alert severity="error">{error}</Alert>
                </Snackbar>
            )}

            {teacherData && (
                <Box sx={{ marginTop: '16px', color: '#f1f5f9' }}>
                    <Typography variant="h6">Teacher Details</Typography>
                    <Typography>Teacher Name: {teacherData.name}</Typography>
                    <Typography>Teacher ID: {teacherData.teacher_id}</Typography>
                    <Typography>School ID: {teacherData.school_id}</Typography>
                    <Typography>Email: {teacherData.email}</Typography>
                    {teacherData.phonenumber && <Typography>Phone Number: {teacherData.phonenumber}</Typography>}
                    {teacherData.gender && <Typography>Gender: {teacherData.gender}</Typography>}
                    {teacherData.age && <Typography>Age: {teacherData.age}</Typography>}
                    {teacherData.religion && <Typography>Religion: {teacherData.religion}</Typography>}
                    {teacherData.date_of_birth && (
                        <Typography>
                            Date of Birth: {new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(teacherData.date_of_birth))}
                        </Typography>
                    )}
                    {teacherData.nationality && <Typography>Nationality: {teacherData.nationality}</Typography>}
                    {teacherData.qualification && <Typography>Qualification: {teacherData.qualification}</Typography>}
                </Box>
            )}
        </Box>
    );
};

export default TeacherSearch;   