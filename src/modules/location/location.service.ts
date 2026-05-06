import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Location } from './location.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

 async create(name: string, type: string, parentId?: number) {
  if (!name || !type) {
    throw new Error('Name and Type are required');
  }

  let parent: Location | null = null;

  if (parentId) {
    parent = await this.locationRepository.findOne({
      where: { id: parentId },
    });

    if (!parent) throw new NotFoundException('Parent not found');
  }

  const location = this.locationRepository.create({
    name,
    type, 
    parent: parent ?? undefined,
  });

  return this.locationRepository.save(location);
}

  // 🔥 GET ALL
  async findAll() {
    return this.locationRepository.find({
      relations: ['parent', 'children'],
    });
  }

  // 🔥 GET TREE (FIXED NULL ISSUE)
  async getTree() {
    const roots = await this.locationRepository.find({
      where: { parent: IsNull() },
      relations: [
        'children',
        'children.children',
        'children.children.children',
      ],
    });

    return roots;
  }

  // 🔥 RECURSIVE CHILD FETCH
  async getAllChildIds(locationId: number): Promise<number[]> {
    const result: number[] = [locationId];

    const children = await this.locationRepository.find({
      where: { parent: { id: locationId } },
    });

    for (const child of children) {
      const childIds = await this.getAllChildIds(child.id);
      result.push(...childIds);
    }

    return result;
  }
  async delete(id: number) {
  return this.locationRepository.delete(id);
}

  // 🔥 FILTER SUPPORT
  async getIdsForFiltering(locationId: number) {
    return this.getAllChildIds(locationId);
  }
}
