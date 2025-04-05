import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input
} from '@mui/material';

interface MaintenanceRequest {
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  photos: File[];
  propertyId: string;
}

const MaintenanceRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<MaintenanceRequest>({
    description: '',
    priority: 'medium',
    category: '',
    photos: [],
    propertyId: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        photos: Array.from(e.target.files || [])
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement maintenance request submission logic
      setSuccess('Maintenance request submitted successfully!');
      setError('');
      // Reset form
      setFormData({
        description: '',
        priority: 'medium',
        category: '',
        photos: [],
        propertyId: ''
      });
    } catch (err) {
      setError('Failed to submit maintenance request. Please try again.');
      setSuccess('');
    }
  };

  const categories = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Appliance',
    'Structural',
    'Pest Control',
    'Other'
  ];

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Submit Maintenance Request
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleChange}
              required
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            label="Description of Issue"
            name="description"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              id="priority"
              name="priority"
              value={formData.priority}
              label="Priority"
              onChange={handleChange}
              required
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Upload Photos
            </Typography>
            <Input
              type="file"
              inputProps={{
                multiple: true,
                accept: 'image/*'
              }}
              onChange={handleFileChange}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              You can upload multiple photos to help describe the issue
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Submit Request
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default MaintenanceRequestForm; 