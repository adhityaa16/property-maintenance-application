import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Home, People, Build, Payment } from '@mui/icons-material';

const OwnerDashboard: React.FC = () => {
  // Mock data - replace with actual API calls
  const properties = [
    { id: 1, name: 'Property Q1', status: 'Occupied', tenant: 'John Doe' },
    { id: 2, name: 'Property Q2', status: 'Vacant', tenant: null },
  ];

  const maintenanceRequests = [
    { id: 1, property: 'Property Q1', issue: 'Plumbing', status: 'Pending' },
    { id: 2, property: 'Property Q2', issue: 'Electrical', status: 'In Progress' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Properties Overview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <Home /> Properties Overview
            </Typography>
            <List>
              {properties.map((property) => (
                <React.Fragment key={property.id}>
                  <ListItem>
                    <ListItemText
                      primary={property.name}
                      secondary={`Status: ${property.status} | Tenant: ${property.tenant || 'None'}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Maintenance Requests */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <Build /> Maintenance Requests
            </Typography>
            <List>
              {maintenanceRequests.map((request) => (
                <React.Fragment key={request.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${request.property} - ${request.issue}`}
                      secondary={`Status: ${request.status}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    <Home /> Total Properties
                  </Typography>
                  <Typography variant="h5">2</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    <People /> Active Tenants
                  </Typography>
                  <Typography variant="h5">1</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    <Payment /> Pending Payments
                  </Typography>
                  <Typography variant="h5">1</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OwnerDashboard; 