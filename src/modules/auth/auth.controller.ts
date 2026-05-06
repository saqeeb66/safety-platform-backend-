import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('test')
  test() {
    return 'Auth working';
  }

  @Post('register')
register(@Body() body: any) {
  return this.authService.register(body);
}

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password); 
  }
}
