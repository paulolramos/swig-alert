import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { IUserService } from 'src/user/user.service.interface';

@Injectable()
export class UserService implements IUserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findUserByUsername(username: string): Promise<User> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findUserById(id: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['sessions'],
    });
  }

  async getFullUserProfile(id: string): Promise<User> {
    const userProfile = await this.userRepository.findOne({
      where: { id },
      relations: ['sessions', 'sessions.beverages'],
    });
    return userProfile;
  }

  async createUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async updateUser(id: string, user: User): Promise<boolean> {
    const _user = await this.userRepository.findOne(id);
    const userNameAlreadyExists = await this.userRepository.findOne({
      username: user.username,
    });

    if (userNameAlreadyExists) {
      // if I already exist, update my own data
      if (userNameAlreadyExists.username === _user.username) {
        await this.userRepository.update(id, user);
        return true;
      } else {
        this.logger.debug(
          `Unable to update. ${userNameAlreadyExists.username} already exists`,
        );
        return false;
      }
    } else {
      await this.userRepository.update(id, user);
      return true;
    }
  }

  async deleteUser(id: string): Promise<void> {
    this.logger.debug(`deleting user ${id}`);
    await this.userRepository.delete(id);
  }
}
