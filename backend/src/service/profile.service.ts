import { AppDataSource } from '../data-source';
import { User }          from '../entity/User';
import { AppError }      from '../errors';

export class ProfileService {

  /**
   * Fetches a single user record by their primary ID.
   * @param id - The unique identifier of the user.
   * @returns The User entity or null if no record exists.
   */
  async getById(id: number): Promise<User | null> {
    return AppDataSource.getRepository(User).findOneBy({ id });
  }

  /**
   * Updates partial profile information for a user.
   * - Trims all string inputs to prevent whitespace-only entries.
   * - Normalizes emails to lowercase.
   * - Performs a unique constraint check before allowing email updates.
   * * @throws {AppError} 404 if the user doesn't exist.
   * @throws {AppError} 409 if the new email is already occupied by another user.
   */
  async update(
    id:   number,
    data: { name?: string; email?: string; phone?: string; address?: string },
  ): Promise<User> {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOneBy({ id });
    if (!user) throw new AppError('User not found', 404);

    if (data.name?.trim())    user.name    = data.name.trim();
    if (data.phone?.trim())   user.phone   = data.phone.trim();
    if (data.address?.trim()) user.address = data.address.trim();

    if (data.email?.trim()) {
      const trimmed  = data.email.trim().toLowerCase();
      const existing = await repo.findOneBy({ email: trimmed });
      if (existing && existing.id !== id) throw new AppError('Email already in use', 409);
      user.email = trimmed;
    }

    return repo.save(user);
  }
}

export const profileService = new ProfileService();