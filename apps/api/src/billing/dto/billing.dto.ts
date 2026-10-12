import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class FundSandboxDto {
  @IsOptional()
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(100, { message: 'Minimum funding amount is 100 NGX' })
  amount?: number;
}

export class ProvisionDedicatedAccountDto {
  @IsString()
  @IsNotEmpty({ message: 'NIN is required' })
  @Length(11, 11, { message: 'A valid 11-digit NIN is required' })
  nin: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @IsBoolean({ message: 'Consent must be a boolean flag' })
  consent: boolean;
}

export class VerifyPaymentDto {
  @IsString({ message: 'Payment reference must be a string' })
  @IsNotEmpty({ message: 'Payment reference is required' })
  reference: string;
}
