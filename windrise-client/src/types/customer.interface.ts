export interface ICustomer {
  name?: string;
  email: string;
  password?: string;
  avatar?: string;

  isDeleted: boolean;

  createdAt: string;
  updatedAt: string;
}