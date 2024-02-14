import express from 'express';
const router = express.Router();

// Routes
import auth from './auth/auth.router';
import channels from './channels/channels.router';
import gateway from './gateway/gateway.router';
import users from './users/users.router';
import { authorisation } from '@lib/middleware';

router.get('/', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.redirect('/api');
  } else {
    res.redirect('../');
  }
});

router.use('/auth', authorisation, auth);
router.use('/channels', authorisation, channels);
router.use('/gateway', gateway);
router.use('/users', authorisation, users);

export default router;
