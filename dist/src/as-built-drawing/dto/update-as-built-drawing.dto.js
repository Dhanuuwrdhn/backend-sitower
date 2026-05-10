"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAsBuiltDrawingDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_as_built_drawing_dto_1 = require("./create-as-built-drawing.dto");
class UpdateAsBuiltDrawingDto extends (0, mapped_types_1.PartialType)(create_as_built_drawing_dto_1.CreateFolderDto) {
}
exports.UpdateAsBuiltDrawingDto = UpdateAsBuiltDrawingDto;
//# sourceMappingURL=update-as-built-drawing.dto.js.map