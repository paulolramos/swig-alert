export type JWTPayload = {
  sub: string;
  username: string;
  iat: number;
  exp: number;
};
