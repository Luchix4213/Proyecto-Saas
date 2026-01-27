import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    oldPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'La nueva contraseña debe contener al menos una mayúscula, un número y un carácter especial',
    })
    newPassword: string;
}
