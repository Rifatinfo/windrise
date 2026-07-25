export interface IAdmin {
  id : string;
  name?: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;

  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}