import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Audit)
    private auditRepository: Repository<Audit>,
  ) {}

  async log(
    userId: number,
    email: string,
    action: string,
    metadata?: any,
  ) {
    console.log('🔥 AUDIT LOG:', action);

    const audit = this.auditRepository.create({
      userId,
      email,
      action,
      ...(metadata && { metadata }),
    });

    return this.auditRepository.save(audit);
  }

  async findAll() {
    return this.auditRepository.find({
      order: { createdAt: 'DESC' }, 
    });
  }
}