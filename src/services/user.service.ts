import { HttpError } from '../errors/http.error';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { UserCreate } from '../types/user.types';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async createUser(userData: Omit<UserCreate, 'password_hash'> & { password: string }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10); // Hash with salt rounds
    const userToCreate = {
      username: userData.username,
      password_hash: hashedPassword,
      clinic_id: userData.clinic_id,
    };
    return this.userRepository.create(userToCreate);
  }

  async validateUser(username: string, passwordInput: string) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new HttpError(401, 'Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(passwordInput, user.password_hash);
    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid username or password');
    }

    return user; // User authenticated
  }
}
