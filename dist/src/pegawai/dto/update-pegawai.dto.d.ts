import { CreatePegawaiDto } from './create-pegawai.dto';
declare const UpdatePegawaiDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreatePegawaiDto, "password">>>;
export declare class UpdatePegawaiDto extends UpdatePegawaiDto_base {
    password?: string;
}
export {};
