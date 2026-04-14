"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const errors_1 = require("../errors");
const profile_service_1 = require("../service/profile.service");
/**
 * Retrieves the full profile details for the currently authenticated user.
 * @route GET /profile
 * @authentication Required (AuthUser context)
 * @returns {Promise<void>} 200 OK with User profile object or 404 if not found.
 */
const getProfile = async (req, res) => {
    const user = await profile_service_1.profileService.getById(req.user.id);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
    });
};
exports.getProfile = getProfile;
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
const updateProfile = async (req, res) => {
    const { name, email, phone, address } = req.body;
    try {
        const user = await profile_service_1.profileService.update(req.user.id, {
            name: typeof name === 'string' ? name : undefined,
            email: typeof email === 'string' ? email : undefined,
            phone: typeof phone === 'string' ? phone : undefined,
            address: typeof address === 'string' ? address : undefined,
        });
        res.json({
            id: user.id, name: user.name, email: user.email,
            phone: user.phone, address: user.address, role: user.role,
        });
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateProfile = updateProfile;
