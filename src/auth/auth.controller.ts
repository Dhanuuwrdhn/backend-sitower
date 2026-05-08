import { Controller, Post, Get, Put, Body, Request, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { LoginDto } from './dto/login.dto'
import { ChangePasswordDto } from './dto/change-password.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.nik, dto.password)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Request() req: any) {
    return req.user
  }

  @Put('password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Body() dto: ChangePasswordDto, @Request() req: any) {
    return this.authService.changePassword(req.user.id, dto.passwordLama, dto.passwordBaru)
  }
}
