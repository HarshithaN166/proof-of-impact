import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuditEvent } from '../models/AuditEvent.js';

const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET || 'proof_of_impact_dev_secret_key_2026';
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, organizationName, role } = req.body;

    // Strict Rule 4: Never allow public users to self-assign Verifier or Admin
    if (role && (role.toLowerCase() === 'verifier' || role.toLowerCase() === 'admin')) {
      return res.status(403).json({
        success: false,
        error: 'Public registration is only permitted for Organizations. Verifiers must be provisioned by authorized administrators.',
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.',
      });
    }

    if (!organizationName || !organizationName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Organization name is required for organization registration.',
      });
    }

    // Check if email already registered
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create organization account
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'organization', // strictly enforced
      organizationName: organizationName.trim(),
      isActive: true,
    });

    // Audit log
    await AuditEvent.create({
      actorUserId: user._id,
      action: 'USER_REGISTERED',
      targetType: 'User',
      targetId: user._id.toString(),
      metadata: { role: user.role, email: user.email },
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully.',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'This account has been deactivated. Contact an administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
    }

    // Record login audit event
    await AuditEvent.create({
      actorUserId: user._id,
      action: 'USER_LOGGED_IN',
      targetType: 'User',
      targetId: user._id.toString(),
      metadata: { role: user.role, email: user.email },
    });

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

