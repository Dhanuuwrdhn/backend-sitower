import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator'

export class CreateFolderDto {
  @IsString()
  nama: string

  @IsString()
  @IsIn(['Kelayakan', 'Grounding', 'Konstruksi', 'K3', 'Lingkungan'])
  kategori: string

  @IsOptional()
  @IsString()
  @IsIn(['berlaku', 'expired'])
  status?: string

  @IsOptional()
  @IsString()
  towerId?: string

  @IsOptional()
  @IsDateString()
  berlakuHingga?: string
}

export class CreateSertifikatDto extends CreateFolderDto {}
