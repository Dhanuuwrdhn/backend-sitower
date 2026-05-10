import { Controller, Post, Get, Put, Body, Request, UseGuards, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { RolesGuard } from './roles.guard'
import { Roles } from './roles.decorator'
import { LoginDto } from './dto/login.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { RequestChangePasswordDto } from './dto/request-change-password.dto'

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
  @ApiOperation({ summary: 'Ganti password langsung (admin use)' })
  @ApiBody({ type: ChangePasswordDto })
  changePassword(@Body() dto: ChangePasswordDto, @Request() req: any) {
    return this.authService.changePassword(req.user.id, dto.passwordLama, dto.passwordBaru)
  }

  // ── Request ganti password (user → pending admin approval) ───────────────────

  @Post('request-change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kirim request ganti password — menunggu persetujuan admin' })
  @ApiBody({ type: RequestChangePasswordDto })
  requestChangePassword(@Body() dto: RequestChangePasswordDto, @Request() req: any) {
    return this.authService.requestChangePassword(
      req.user.id,
      dto.passwordLama,
      dto.passwordBaru,
      dto.konfirmasiPasswordBaru,
    )
  }

  // ── Admin: manage password change requests ────────────────────────────────────

  @Get('password-change-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List semua request ganti password (admin)' })
  listRequests() {
    return this.authService.listPasswordChangeRequests()
  }

  @Post('password-change-requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setujui request ganti password (admin)' })
  @ApiParam({ name: 'id', description: 'Password change request ID' })
  approveRequest(@Param('id') id: string, @Request() req: any) {
    return this.authService.approvePasswordChangeRequest(id, req.user.id)
  }

  @Post('password-change-requests/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tolak request ganti password (admin)' })
  @ApiParam({ name: 'id', description: 'Password change request ID' })
  rejectRequest(@Param('id') id: string, @Request() req: any) {
    return this.authService.rejectPasswordChangeRequest(id, req.user.id)
  }
}
