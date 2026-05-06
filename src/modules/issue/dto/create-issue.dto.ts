import { IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateIssueDto {
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  referenceStandard?: string;

  @IsOptional()
  actionPlan?: string;

  @IsOptional()
  @IsNumber()
  locationId?: number;
}