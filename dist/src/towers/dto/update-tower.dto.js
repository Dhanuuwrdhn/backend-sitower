"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTowerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_tower_dto_1 = require("./create-tower.dto");
class UpdateTowerDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(create_tower_dto_1.CreateTowerDto, ['id'])) {
}
exports.UpdateTowerDto = UpdateTowerDto;
//# sourceMappingURL=update-tower.dto.js.map