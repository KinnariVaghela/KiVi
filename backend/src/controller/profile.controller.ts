import { Request, Response } from 'express';
import { AuthUser }          from '../middleware/auth';
import { AppError }          from '../errors';
import { profileService }    from '../service/profile.service';

/**
 * Retrieves the full profile details for the currently authenticated user.
 * @route GET /profile
 * @authentication Required (AuthUser context)
 * @returns {Promise<void>} 200 OK with User profile object or 404 if not found.
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await profileService.getById((req.user as AuthUser).id);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({
    id:        user.id,
    name:      user.name,
    email:     user.email,
    phone:     user.phone,
    address:   user.address,
    role:      user.role,
    createdAt: user.createdAt,
  });
};

/**
 * Updates the profile information for the authenticated user.
 * Only provided fields will be updated; undefined fields are ignored by the service.
 * @route PATCH /profile
 * @authentication Required (AuthUser context)
 * @body {string} [name] - Updated full name
 * @body {string} [email] - Updated email address
 * @body {string} [phone] - Updated contact number
 * @body {string} [address] - Updated physical address
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, address } = req.body as Record<string, unknown>;
  try {
    const user = await profileService.update((req.user as AuthUser).id, {
      name:    typeof name    === 'string' ? name    : undefined,
      email:   typeof email   === 'string' ? email   : undefined,
      phone:   typeof phone   === 'string' ? phone   : undefined,
      address: typeof address === 'string' ? address : undefined,
    });
    res.json({
      id: user.id, name: user.name, email: user.email,
      phone: user.phone, address: user.address, role: user.role,
    });
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};