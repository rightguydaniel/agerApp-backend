"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const argon2 = __importStar(require("argon2"));
/**
 * Hash a password using Argon2
 * @param plainPassword The plain text password to hash
 * @returns Promise that resolves to the hashed password
 */
function hashPassword(plainPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield argon2.hash(plainPassword, {
                type: argon2.argon2id, // Recommended hybrid version
                memoryCost: 65536, // Memory usage in KiB (64MB)
                timeCost: 3, // Number of iterations
                parallelism: 1, // Number of parallel threads
                hashLength: 32 // Output length in bytes
            });
        }
        catch (err) {
            throw new Error('Failed to hash password');
        }
    });
}
/**
 * Verify a password against a stored hash
 * @param hashedPassword The stored hashed password
 * @param plainPassword The plain text password to verify
 * @returns Promise that resolves to true if passwords match
 */
function verifyPassword(plainPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield argon2.verify(hashedPassword, plainPassword);
        }
        catch (err) {
            console.error('Password verification error:', err);
            return false;
        }
    });
}
