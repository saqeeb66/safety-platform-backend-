import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('locations')
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Post()
  create(@Body() body: any) {
    return this.locationService.create(
      body.name,
      body.type,        
      body.parentId    
    );
  }

  @Delete(':id')
remove(@Param('id') id: number) {
  return this.locationService.delete(id);
}

  @Get()
  findAll() {
    return this.locationService.findAll();
  }

  @Get('tree')
  getTree() {
    return this.locationService.getTree();
  }
}
