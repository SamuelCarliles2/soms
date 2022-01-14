"use strict";
/*
MIT License

Copyright (c) 2020 Samuel Carliles, Marcus Hansen, and Promit Roy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var SomsNodeType;
(function (SomsNodeType) {
    SomsNodeType["SOMSENUM"] = "SOMSENUM";
    SomsNodeType["SOMSFIELD"] = "SOMSFIELD";
    SomsNodeType["SOMSCLASS"] = "SOMSCLASS";
    SomsNodeType["SOMSPACKAGE"] = "SOMSPACKAGE";
})(SomsNodeType = exports.SomsNodeType || (exports.SomsNodeType = {}));
var SomsEnum = /** @class */ (function () {
    function SomsEnum(e) {
        this.somsNodeType = SomsNodeType.SOMSENUM;
        this.name = e.name;
        this.values = e.values;
    }
    return SomsEnum;
}());
exports.SomsEnum = SomsEnum;
var SomsField = /** @class */ (function () {
    function SomsField(f) {
        this.somsNodeType = SomsNodeType.SOMSFIELD;
        this.name = f.name;
        this.typeIdentifier = f.typeIdentifier;
        this.dimensionality = f.dimensionality ? f.dimensionality : 0;
        this.optional = f.optional ? f.optional : false;
        this.staticConst = f.staticConst ? f.staticConst : false;
        this.staticConstValue = ("staticConstValue" in f
            && f.staticConstValue !== null
            && f.staticConstValue !== undefined)
            ? f.staticConstValue
            : null;
    }
    return SomsField;
}());
exports.SomsField = SomsField;
var SomsClass = /** @class */ (function () {
    function SomsClass(c) {
        this.somsNodeType = SomsNodeType.SOMSCLASS;
        this.name = c.name;
        this.fields = c.fields ? c.fields : [];
    }
    return SomsClass;
}());
exports.SomsClass = SomsClass;
var SomsPackage = /** @class */ (function () {
    function SomsPackage(p) {
        this.somsNodeType = SomsNodeType.SOMSPACKAGE;
        this.path = p.path;
        this.name = p.name ? p.name : this.path.join(".");
        this.enums = p.enums ? p.enums : [];
        this.classes = p.classes ? p.classes : [];
        this.packageImportAliases = p.packageImportAliases ? p.packageImportAliases : {};
        this.packageMemberImportAliases = p.packageMemberImportAliases ? p.packageMemberImportAliases : {};
    }
    return SomsPackage;
}());
exports.SomsPackage = SomsPackage;
var SomsTypeIdentifier = /** @class */ (function () {
    function SomsTypeIdentifier(name) {
        this.name = name;
    }
    return SomsTypeIdentifier;
}());
exports.SomsTypeIdentifier = SomsTypeIdentifier;
var SomsPrimitiveType = /** @class */ (function (_super) {
    __extends(SomsPrimitiveType, _super);
    function SomsPrimitiveType(name) {
        var _this = _super.call(this, name) || this;
        _this.name = name;
        return _this;
    }
    return SomsPrimitiveType;
}(SomsTypeIdentifier));
exports.SomsPrimitiveType = SomsPrimitiveType;
var SomsNumberType = /** @class */ (function (_super) {
    __extends(SomsNumberType, _super);
    function SomsNumberType(name) {
        var _this = _super.call(this, name) || this;
        _this.name = name;
        return _this;
    }
    return SomsNumberType;
}(SomsPrimitiveType));
exports.SomsNumberType = SomsNumberType;
var SomsInt64TypeIdentifier = /** @class */ (function (_super) {
    __extends(SomsInt64TypeIdentifier, _super);
    function SomsInt64TypeIdentifier() {
        return _super.call(this, "int64") || this;
    }
    return SomsInt64TypeIdentifier;
}(SomsNumberType));
exports.SomsInt64TypeIdentifier = SomsInt64TypeIdentifier;
var SomsDoubleTypeIdentifier = /** @class */ (function (_super) {
    __extends(SomsDoubleTypeIdentifier, _super);
    function SomsDoubleTypeIdentifier() {
        return _super.call(this, "double") || this;
    }
    return SomsDoubleTypeIdentifier;
}(SomsNumberType));
exports.SomsDoubleTypeIdentifier = SomsDoubleTypeIdentifier;
var SomsBooleanTypeIdentifier = /** @class */ (function (_super) {
    __extends(SomsBooleanTypeIdentifier, _super);
    function SomsBooleanTypeIdentifier() {
        return _super.call(this, "boolean") || this;
    }
    return SomsBooleanTypeIdentifier;
}(SomsPrimitiveType));
exports.SomsBooleanTypeIdentifier = SomsBooleanTypeIdentifier;
var SomsStringTypeIdentifier = /** @class */ (function (_super) {
    __extends(SomsStringTypeIdentifier, _super);
    function SomsStringTypeIdentifier() {
        return _super.call(this, "string") || this;
    }
    return SomsStringTypeIdentifier;
}(SomsPrimitiveType));
exports.SomsStringTypeIdentifier = SomsStringTypeIdentifier;
var SomsUserDefinedTypeIdentifier = /** @class */ (function (_super) {
    __extends(SomsUserDefinedTypeIdentifier, _super);
    function SomsUserDefinedTypeIdentifier(name) {
        var _this = _super.call(this, name) || this;
        _this.name = name;
        return _this;
    }
    return SomsUserDefinedTypeIdentifier;
}(SomsTypeIdentifier));
exports.SomsUserDefinedTypeIdentifier = SomsUserDefinedTypeIdentifier;
var SomsEnumTypeIdentifier = /** @class */ (function (_super) {
    __extends(SomsEnumTypeIdentifier, _super);
    function SomsEnumTypeIdentifier(name) {
        var _this = _super.call(this, name) || this;
        _this.name = name;
        return _this;
    }
    return SomsEnumTypeIdentifier;
}(SomsUserDefinedTypeIdentifier));
exports.SomsEnumTypeIdentifier = SomsEnumTypeIdentifier;
var SomsClassTypeIdentifier = /** @class */ (function (_super) {
    __extends(SomsClassTypeIdentifier, _super);
    function SomsClassTypeIdentifier(name) {
        var _this = _super.call(this, name) || this;
        _this.name = name;
        return _this;
    }
    return SomsClassTypeIdentifier;
}(SomsUserDefinedTypeIdentifier));
exports.SomsClassTypeIdentifier = SomsClassTypeIdentifier;
var SomsPrimitiveTypeList = {
    boolean: 0,
    int64: 1,
    double: 2,
    string: 3
};
function isSomsPrimitiveType(t) {
    return t instanceof SomsPrimitiveType || t in SomsPrimitiveTypeList;
}
exports.isSomsPrimitiveType = isSomsPrimitiveType;
//# sourceMappingURL=somstree.js.map