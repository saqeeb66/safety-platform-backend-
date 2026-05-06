import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/roles/roles.guard';
import { Roles } from '../../common/roles/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  createUser(@Body() body: any) {
    return this.usersService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Roles('ADMIN')                        
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}