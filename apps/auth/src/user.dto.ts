import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

export class LoginDto {
    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    username: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty()
    password: string;
}
