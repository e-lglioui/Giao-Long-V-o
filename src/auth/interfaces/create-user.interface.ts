export interface CreateUserData {
    username: string;
    email: string;
    password: string;
    confirmationToken: string;
    isConfirmed: boolean;
  }