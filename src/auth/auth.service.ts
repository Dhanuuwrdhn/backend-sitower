import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(nik: string, password: string) {
    const pegawai = await this.prisma.pegawai.findUnique({ where: { nik } })
    if (!pegawai || !pegawai.aktif)
      throw new UnauthorizedException('NIK tidak ditemukan atau akun nonaktif')

    const valid = await bcrypt.compare(password, pegawai.password)
    if (!valid) throw new UnauthorizedException('Password salah')

    const payload = {
      sub: pegawai.id,
      nik: pegawai.nik,
      nama: pegawai.nama,
      role: pegawai.role,
      jabatan: pegawai.jabatan,
      unit: pegawai.unit,
    }

    return {
      access_token: this.jwt.sign(payload),
      pegawai: {
        id: pegawai.id,
        nik: pegawai.nik,
        nama: pegawai.nama,
        jabatan: pegawai.jabatan,
        unit: pegawai.unit,
        role: pegawai.role,
        foto: pegawai.foto,
      },
    }
  }

  async changePassword(userId: string, passwordLama: string, passwordBaru: string) {
    const pegawai = await this.prisma.pegawai.findUnique({ where: { id: userId } })
    if (!pegawai) throw new UnauthorizedException()

    const valid = await bcrypt.compare(passwordLama, pegawai.password)
    if (!valid) throw new BadRequestException('Password lama salah')

    const hashed = await bcrypt.hash(passwordBaru, 10)
    await this.prisma.pegawai.update({
      where: { id: userId },
      data: { password: hashed },
    })

    return { message: 'Password berhasil diubah' }
  }
}
