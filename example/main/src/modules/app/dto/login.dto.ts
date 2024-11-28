import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';
import { Expose } from 'class-transformer';

export class LoginDto {
  @Expose()
  @ApiProperty({
    description: 'username',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 36)
  readonly username: string;

  @Expose()
  @ApiProperty({
    description: 'password',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 32)
  readonly password: string;
}
