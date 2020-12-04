import { IsNotEmpty } from 'class-validator';

export class Member {
  @IsNotEmpty()
  readonly name: string;
  @IsNotEmpty()
  readonly age: string;
}

export class createMemberByAccount extends Member {
  @IsNotEmpty()
  readonly account: string;
  @IsNotEmpty()
  readonly password: string;
}
