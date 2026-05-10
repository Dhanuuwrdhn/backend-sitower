import { Controller, Post, Get, Put, Body, Request, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { LoginDto } from './dto/login.dto'
import { ChangePasswordDto } from './dto/change-password.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login dengan NIK dan password' })
  @ApiBody({ type: LoginDto })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.nik, dto.password)
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ambil profil user yang sedang login' })
  profile(@Request() req: any) {
    return req.user
  }

  @Put('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ganti password user yang sedang login' })
  @ApiBody({ type: ChangePasswordDto })
  changePassword(@Body() dto: ChangePasswordDto, @Request() req: any) {
    return this.authService.changePassword(req.user.id, dto.passwordLama, dto.passwordBaru)
  }
}
