import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'

const PASSWORD_CHANGE_EXPIRY_HOURS = 24

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(identifier: string, password: string) {
    // NIP is the canonical login identifier. Born2Works superadmin is preserved as a
    // special case: its `nik` column stores the literal string "Born2Works", so the same
    // lookup matches both regular PLN users (numeric NIP) and the superadmin.
    const pegawai = await this.prisma.pegawai.findFirst({
      where: { nik: identifier },
    })
    if (!pegawai || !pegawai.aktif)
      throw new UnauthorizedException('NIP tidak ditemukan atau akun nonaktif')

    if (pegawai.expiredAt && pegawai.expiredAt < new Date())
      throw new ForbiddenException('Anda tidak bisa login')

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

  async requestChangePassword(
    userId: string,
    passwordLama: string,
    passwordBaru: string,
    konfirmasiPasswordBaru: string,
  ) {
    if (passwordBaru !== konfirmasiPasswordBaru)
      throw new BadRequestException('Password baru dan konfirmasi tidak cocok')

    const pegawai = await this.prisma.pegawai.findUnique({ where: { id: userId } })
    if (!pegawai) throw new UnauthorizedException()

    const valid = await bcrypt.compare(passwordLama, pegawai.password)
    if (!valid) throw new BadRequestException('Password lama salah')

    // Tolak jika sudah ada request pending yang belum expired
    const existing = await this.prisma.passwordChangeRequest.findFirst({
      where: {
        pegawaiId: userId,
        status: 'pending',
        expiredAt: { gt: new Date() },
      },
    })
    if (existing)
      throw new ConflictException('Sudah ada permintaan ganti password yang sedang menunggu persetujuan admin')

    const newPasswordHash = await bcrypt.hash(passwordBaru, 10)
    const expiredAt = new Date()
    expiredAt.setHours(expiredAt.getHours() + PASSWORD_CHANGE_EXPIRY_HOURS)

    await this.prisma.passwordChangeRequest.create({
      data: {
        pegawaiId: userId,
        newPasswordHash,
        expiredAt,
      },
    })

    return { message: 'Permintaan ganti password telah dikirim ke admin untuk disetujui' }
  }

  // ── Admin: list all pending requests ─────────────────────────────────────────

  async listPasswordChangeRequests() {
    const requests = await this.prisma.passwordChangeRequest.findMany({
      orderBy: { requestedAt: 'desc' },
      include: {
        pegawai: { select: { id: true, nik: true, nama: true, jabatan: true, unit: true } },
        reviewedBy: { select: { id: true, nama: true } },
      },
    })

    // Auto-expire stale pending requests
    const now = new Date()
    return requests.map(r => ({
      ...r,
      newPasswordHash: undefined, // never expose hash
      status: r.status === 'pending' && r.expiredAt < now ? 'expired' : r.status,
    }))
  }

  // ── Admin: approve request ────────────────────────────────────────────────────

  async approvePasswordChangeRequest(requestId: string, adminId: string) {
    const request = await this.prisma.passwordChangeRequest.findUnique({
      where: { id: requestId },
    })
    if (!request) throw new NotFoundException('Request tidak ditemukan')
    if (request.status !== 'pending') throw new BadRequestException('Request sudah diproses')
    if (request.expiredAt < new Date()) throw new BadRequestException('Request sudah kedaluwarsa')

    await this.prisma.$transaction([
      this.prisma.pegawai.update({
        where: { id: request.pegawaiId },
        data: { password: request.newPasswordHash },
      }),
      this.prisma.passwordChangeRequest.update({
        where: { id: requestId },
        data: { status: 'approved', reviewedAt: new Date(), reviewedById: adminId },
      }),
    ])

    return { message: 'Permintaan ganti password telah disetujui dan password berhasil diperbarui' }
  }

  // ── Admin: reject request ─────────────────────────────────────────────────────

  async rejectPasswordChangeRequest(requestId: string, adminId: string) {
    const request = await this.prisma.passwordChangeRequest.findUnique({
      where: { id: requestId },
    })
    if (!request) throw new NotFoundException('Request tidak ditemukan')
    if (request.status !== 'pending') throw new BadRequestException('Request sudah diproses')

    await this.prisma.passwordChangeRequest.update({
      where: { id: requestId },
      data: { status: 'rejected', reviewedAt: new Date(), reviewedById: adminId },
    })

    return { message: 'Permintaan ganti password telah ditolak' }
  }

  // ── Admin: delete request ─────────────────────────────────────────────────────

  async deletePasswordChangeRequest(requestId: string) {
    const request = await this.prisma.passwordChangeRequest.findUnique({
      where: { id: requestId },
    })
    if (!request) throw new NotFoundException('Request tidak ditemukan')

    await this.prisma.passwordChangeRequest.delete({ where: { id: requestId } })
    return { message: 'Permintaan ganti password telah dihapus' }
  }
}
