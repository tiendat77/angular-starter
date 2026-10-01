export interface UserModel {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  permissions?: string[];
}
