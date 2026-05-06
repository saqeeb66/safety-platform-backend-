import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './issue.entity';
import { IssueService } from './issue.service';
import { IssueController } from './issue.controller';
import { JwtModule } from '@nestjs/jwt';
import { Location } from '../location/location.entity';
import { AuditModule } from '../audit/audit.module'; 

@Module({
  imports: [
  TypeOrmModule.forFeature([Issue,Location]),
  AuditModule,
  JwtModule.register({
    secret: 'super_secret_key',
  }),
],
  providers: [IssueService],
  controllers: [IssueController],
})
export class IssueModule {}