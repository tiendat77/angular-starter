export interface ClaimModel {
  userID: string;
  name: string;
  email: string | null;
  avatar: string | null;
  permissions: string[];

  exp: number;
  iat: number;
  iss: string;

  [key: string]: any;
}
