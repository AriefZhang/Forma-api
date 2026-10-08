import { Request } from "express";
export interface AuthUser {
  sub: string;
  role: "TRAINER" | "CLIENT";
}
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
