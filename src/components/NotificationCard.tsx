import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Alert,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import {
  requestNotificationPermission,
  isNotificationEnabled,
  checkAndNotifyExpiredProducts,
} from '../services/notificationService';

export const NotificationCard = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setNotificationsEnabled(isNotificationEnabled());
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    
    if (granted) {
      setShowSuccess(true);
      // Check for expired products immediately after enabling
      await checkAndNotifyExpiredProducts();
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        <Box sx={{ color: notificationsEnabled ? '#2e7d32' : '#757575', mb: 2 }}>
          {notificationsEnabled ? (
            <NotificationsActiveIcon sx={{ fontSize: 60 }} />
          ) : (
            <NotificationsOffIcon sx={{ fontSize: 60 }} />
          )}
        </Box>
        <Typography gutterBottom variant="h6" component="h2">
          {notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {notificationsEnabled
            ? 'You will be notified about expiring products'
            : 'Get notified when products expire or are expiring soon'}
        </Typography>
        {showSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Notifications enabled successfully!
          </Alert>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
        {!notificationsEnabled && (
          <Button size="small" variant="contained" onClick={handleEnableNotifications}>
            Enable
          </Button>
        )}
        {notificationsEnabled && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => checkAndNotifyExpiredProducts()}
          >
            Check Now
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
