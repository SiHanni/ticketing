export class CreateUserDto {
  email: string;
  password: string;
  name?: string;
}

export class LoginUserDto {
  email: string;
  password: string;
}
