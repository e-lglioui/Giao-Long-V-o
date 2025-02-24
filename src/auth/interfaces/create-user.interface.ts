export interface CreateUserData {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmationToken: string;
    isConfirmed: boolean;
  }