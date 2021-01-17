import { User } from 'src/user/user.entity';

export interface IUserService {
  getAllUsers: () => Promise<User[]>;
  findUserById: (id: string) => Promise<User>;
  findUserByUsername: (username: string) => Promise<User>;
  getFullUserProfile: (id: string) => Promise<User>;
  createUser: (user: User) => Promise<User>;
  updateUser: (id: string, user: User) => Promise<boolean>;
  deleteUser: (id: string) => Promise<void>;
}
