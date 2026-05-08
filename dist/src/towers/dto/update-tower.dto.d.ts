import { CreateTowerDto } from './create-tower.dto';
declare const UpdateTowerDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateTowerDto, "id">>>;
export declare class UpdateTowerDto extends UpdateTowerDto_base {
}
export {};
