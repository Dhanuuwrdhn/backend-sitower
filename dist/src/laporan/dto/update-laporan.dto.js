"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLaporanDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_laporan_dto_1 = require("./create-laporan.dto");
class UpdateLaporanDto extends (0, mapped_types_1.PartialType)(create_laporan_dto_1.CreateLaporanDto) {
}
exports.UpdateLaporanDto = UpdateLaporanDto;
//# sourceMappingURL=update-laporan.dto.js.map