// Extend Express Request to include userId for JWT auth
import 'express-serve-static-core';
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}
