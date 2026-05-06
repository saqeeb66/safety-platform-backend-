import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue, IssueStatus } from './issue.entity';
import { Location } from '../location/location.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,

    @InjectRepository(Location)
    private locationRepository: Repository<Location>,

    private auditService: AuditService,
  ) {}

  // ✅ STRONGLY TYPED WORKFLOW
  private allowedTransitions: Record<IssueStatus, IssueStatus[]> = {
    OPEN: [IssueStatus.ASSIGNED],
    ASSIGNED: [IssueStatus.IN_PROGRESS],
    IN_PROGRESS: [IssueStatus.RESOLVED],
    RESOLVED: [IssueStatus.APPROVED],
    APPROVED: [IssueStatus.CLOSED],
    CLOSED: [],
  };

  // 🔥 RECURSIVE LOCATION HELPER
  private async getAllChildLocationIds(locationId: number): Promise<number[]> {
    const result: number[] = [locationId];

    const children = await this.locationRepository.find({
      where: { parent: { id: locationId } },
    });

    for (const child of children) {
      const childIds = await this.getAllChildLocationIds(child.id);
      result.push(...childIds);
    }

    return result;
  }

  async create(data: any, user: any) {
    let location: Location | null = null;

    if (data.locationId) {
      location = await this.locationRepository.findOne({
        where: { id: data.locationId },
      });

      if (!location) {
        throw new NotFoundException('Location not found');
      }
    }

    const issue = this.issueRepository.create({
      description: data.description,
      referenceStandard: data.referenceStandard,
      actionPlan: data.actionPlan,
      image: data.image,
      createdBy: user.email,
      ...(location && { location }),
    });

    const saved = await this.issueRepository.save(issue);

    await this.auditService.log(
      user.userId,
      user.email,
      'ISSUE_CREATED',
      { issueId: saved.id },
    );

    return saved;
  }

  async findAll(filters: any) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;

    const query = this.issueRepository
      .createQueryBuilder('issue')
      .leftJoinAndSelect('issue.location', 'location');

    // ✅ HIERARCHY FILTER
    if (filters.locationId) {
      const ids = await this.getAllChildLocationIds(filters.locationId);

      query.andWhere('location.id IN (:...ids)', { ids });
    }

    if (filters.status) {
      query.andWhere('issue.status = :status', {
        status: filters.status,
      });
    }

    if (filters.fromDate && filters.toDate) {
      query.andWhere('issue.createdAt BETWEEN :from AND :to', {
        from: filters.fromDate,
        to: filters.toDate,
      });
    }

    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { total, page, limit, data };
  }

  async updateStatus(issueId: number, newStatus: IssueStatus, user: any) {
    const issue = await this.issueRepository.findOne({
      where: { id: issueId },
    });

    if (!issue) throw new NotFoundException('Issue not found');

    const role = user.role;

    // ✅ WORKFLOW CHECK
    const allowed = this.allowedTransitions[issue.status];

    if (!allowed.includes(newStatus)) {
      throw new ForbiddenException(
        `Invalid transition: ${issue.status} → ${newStatus}`,
      );
    }

    // ✅ ROLE CHECKS
    if (newStatus === IssueStatus.IN_PROGRESS && role !== 'USER') {
      throw new ForbiddenException('Only USER can start work');
    }

    if (newStatus === IssueStatus.RESOLVED && role !== 'USER') {
      throw new ForbiddenException('Only USER can resolve');
    }

    if (newStatus === IssueStatus.APPROVED && role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can approve');
    }

    if (newStatus === IssueStatus.CLOSED && role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can close');
    }

    // ✅ OWNERSHIP CHECK
    if (role === 'USER' && issue.assignedUser !== user.email) {
      throw new ForbiddenException('Not your assigned issue');
    }

    issue.status = newStatus;

    const saved = await this.issueRepository.save(issue);

    await this.auditService.log(
      user.userId,
      user.email,
      `STATUS_${newStatus}`,
      { issueId },
    );

    return saved;
  }

  async assignIssue(issueId: number, userEmail: string, user: any) {
    const issue = await this.issueRepository.findOne({
      where: { id: issueId },
    });

    if (!issue) throw new NotFoundException('Issue not found');

    // ✅ ADMIN ONLY
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can assign');
    }

    // ✅ ONLY FROM OPEN
    if (issue.status !== IssueStatus.OPEN) {
      throw new ForbiddenException('Issue must be OPEN to assign');
    }

    issue.assignedUser = userEmail;
    issue.status = IssueStatus.ASSIGNED;

    const saved = await this.issueRepository.save(issue);

    await this.auditService.log(
      user.userId,
      user.email,
      'ISSUE_ASSIGNED',
      { issueId, assignedTo: userEmail },
    );

    return saved;
  }

  async getStats() {
    return {
      OPEN: await this.issueRepository.count({
        where: { status: IssueStatus.OPEN },
      }),
      ASSIGNED: await this.issueRepository.count({
        where: { status: IssueStatus.ASSIGNED },
      }),
      IN_PROGRESS: await this.issueRepository.count({
        where: { status: IssueStatus.IN_PROGRESS },
      }),
      RESOLVED: await this.issueRepository.count({
        where: { status: IssueStatus.RESOLVED },
      }),
      CLOSED: await this.issueRepository.count({
        where: { status: IssueStatus.CLOSED },
      }),
    };
  }

  async getDashboard() {
    const total = await this.issueRepository.count();

    const byLocation = await this.issueRepository
      .createQueryBuilder('issue')
      .leftJoin('issue.location', 'location')
      .select('location.name', 'location')
      .addSelect('COUNT(*)', 'count')
      .groupBy('location.name')
      .getRawMany();

    const byAssignee = await this.issueRepository
      .createQueryBuilder('issue')
      .select('issue.assignedUser', 'user')
      .addSelect('COUNT(*)', 'count')
      .groupBy('issue.assignedUser')
      .getRawMany();

    return { total, byLocation, byAssignee };
  }
}