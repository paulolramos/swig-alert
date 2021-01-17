import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Render,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async findAll() {
    return await this.userService.getAllUsers();
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() user: User,
    @Res() res: Response,
  ) {
    const isUpdated = await this.userService.updateUser(id, user);
    if (isUpdated) {
      return res.redirect('/profile');
    } else {
      // or error page?
      return res.redirect('/profile/update');
    }
  }

  @Get(':id/delete')
  @Render('pages/profile/delete')
  async confirmDelete(@Param('id') id: string) {
    const user = await this.userService.findUserById(id);
    return { user };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    res.clearCookie('jwt.sa');
    await this.userService.deleteUser(id);
    return res.redirect('/');
  }
}
