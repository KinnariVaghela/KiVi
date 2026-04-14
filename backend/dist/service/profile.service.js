"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileService = exports.ProfileService = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const errors_1 = require("../errors");
class ProfileService {
    /**
     * Fetches a single user record by their primary ID.
     * @param id - The unique identifier of the user.
     * @returns The User entity or null if no record exists.
     */
    async getById(id) {
        return data_source_1.AppDataSource.getRepository(User_1.User).findOneBy({ id });
    }
    /**
     * Updates partial profile information for a user.
     * - Trims all string inputs to prevent whitespace-only entries.
     * - Normalizes emails to lowercase.
     * - Performs a unique constraint check before allowing email updates.
     * * @throws {AppError} 404 if the user doesn't exist.
     * @throws {AppError} 409 if the new email is already occupied by another user.
     */
    async update(id, data) {
        const repo = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = await repo.findOneBy({ id });
        if (!user)
            throw new errors_1.AppError('User not found', 404);
        if (data.name?.trim())
            user.name = data.name.trim();
        if (data.phone?.trim())
            user.phone = data.phone.trim();
        if (data.address?.trim())
            user.address = data.address.trim();
        if (data.email?.trim()) {
            const trimmed = data.email.trim().toLowerCase();
            const existing = await repo.findOneBy({ email: trimmed });
            if (existing && existing.id !== id)
                throw new errors_1.AppError('Email already in use', 409);
            user.email = trimmed;
        }
        return repo.save(user);
    }
}
exports.ProfileService = ProfileService;
exports.profileService = new ProfileService();
