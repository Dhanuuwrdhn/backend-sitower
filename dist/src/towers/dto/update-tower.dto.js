"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTowerDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_tower_dto_1 = require("./create-tower.dto");
class UpdateTowerDto extends (0, mapped_types_1.PartialType)((0, mapped_types_1.OmitType)(create_tower_dto_1.CreateTowerDto, ['id'])) {
}
exports.UpdateTowerDto = UpdateTowerDto;
//# sourceMappingURL=update-tower.dto.js.map