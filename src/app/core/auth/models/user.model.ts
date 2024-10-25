export interface UserModel {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  permissions: string[];
}
