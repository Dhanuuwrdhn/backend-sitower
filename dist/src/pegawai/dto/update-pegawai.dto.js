"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePegawaiDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_pegawai_dto_1 = require("./create-pegawai.dto");
class UpdatePegawaiDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.OmitType)(create_pegawai_dto_1.CreatePegawaiDto, ['password'])) {
    password;
}
exports.UpdatePegawaiDto = UpdatePegawaiDto;
//# sourceMappingURL=update-pegawai.dto.js.map