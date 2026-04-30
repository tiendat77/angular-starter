export interface UserModel {
  id: string;
  organizationID?: string;
  name: string;
  email: string;
  avatar?: string;
  permissions?: string[];
  status?: string;
}
