import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../audit/audit.service';
import { audit } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private auditService: AuditService,

    
  ) {}


 async validateUser(email: string, password: string) {
  const user = await this.userRepository.findOne({
    where: { email },
  });

  if (!user) {
    await this.auditService.log(0, email, 'FAILED_LOGIN');
    throw new UnauthorizedException('User not found');
  }

if (user.lockUntil) {
  if (user.lockUntil > new Date()) {
    // still locked
    throw new UnauthorizedException(
      'Account is temporarily locked. Try again later.'
    );
  } else {
    user.failedAttempts = 0;
    user.lockUntil = null;

    await this.userRepository.save(user);

    console.log("✅ ACCOUNT AUTO-UNLOCKED");
  }
}

  const isMatch = await bcrypt.compare(password, user.password);

 if (!isMatch) {
  user.failedAttempts += 1;

  console.log("Attempts:", user.failedAttempts); // 👈 ADD THIS

  if (user.failedAttempts >= 5) {
    console.log("🔥 LOCKING USER"); // 👈 ADD THIS

    user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
  }

  await this.userRepository.save(user);
    await this.auditService.log(user.id, user.email, 'FAILED_LOGIN');

    throw new UnauthorizedException('Invalid password');
  }

     user.failedAttempts = 0;
     user.lockUntil = null;

  await this.userRepository.save(user);
  await this.auditService.log(user.id, user.email, 'LOGIN');

  return user;
}

 async register(data: any) {
  const { name, email, password, role } = data;

  const existing = await this.userRepository.findOne({
    where: { email },
  });

  if (existing) {
    throw new UnauthorizedException('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = this.userRepository.create({
    name, // ✅ FIX HERE
    email,
    password: hashedPassword,
    role: role || 'USER',
    failedAttempts: 0,
    lockUntil: null,
  });

  const savedUser = await this.userRepository.save(user);

  await this.auditService.log(
    savedUser.id,
    savedUser.email,
    'USER_REGISTERED',
  );

  return {
    message: 'User registered successfully',
  };
}

async login(email: string, password: string) {
  const user = await this.validateUser(email, password);

  console.log("🔥 LOGIN CALLED"); 

  await this.auditService.log(user.id, user.email, 'LOGIN');

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    access_token: this.jwtService.sign(payload),
     role: user.role,
    email: user.email,
  };
}
}
