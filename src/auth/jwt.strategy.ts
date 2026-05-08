import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'fallback_secret',
    })
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      nik: payload.nik,
      nama: payload.nama,
      role: payload.role,
      jabatan: payload.jabatan,
      unit: payload.unit,
    }
  }
}
