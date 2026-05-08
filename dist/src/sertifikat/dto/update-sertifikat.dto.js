"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSertifikatDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_sertifikat_dto_1 = require("./create-sertifikat.dto");
class UpdateSertifikatDto extends (0, mapped_types_1.PartialType)(create_sertifikat_dto_1.CreateSertifikatDto) {
}
exports.UpdateSertifikatDto = UpdateSertifikatDto;
//# sourceMappingURL=update-sertifikat.dto.js.map