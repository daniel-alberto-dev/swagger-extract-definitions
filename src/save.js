"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const save = async (text, path) => {
    const filePath = (0, path_1.resolve)(path);
    try {
        const data = await fs_1.promises.readFile(filePath);
        if (data.toString() === text) {
            return;
        }
    }
    catch (e) { }
    await fs_1.promises.writeFile(filePath, text);
};
exports.save = save;
