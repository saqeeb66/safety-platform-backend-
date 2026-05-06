import { Controller, Post, Body, Get } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('locations')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Post()
  create(@Body() body: any) {
    return this.locationService.create(body.name, body.parentId);
  }

  @Get()
  findAll() {
    return this.locationService.findAll();
  }
}