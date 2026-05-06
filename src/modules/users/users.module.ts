import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';   // 👈 ADD THIS

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({              // 👈 ADD THIS
      secret: 'super_secret_key',
    }),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}