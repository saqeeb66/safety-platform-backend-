import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Delete,
  BadRequestException,
} from '@nestjs/common';

import { IssueService } from './issue.service';
import { JwtAuthGuard } from '../../common/jwt/jwt.guard';
import { RolesGuard } from '../../common/roles/roles.guard';
import { Roles } from '../../common/roles/roles.decorator';
import { CreateIssueDto } from './dto/create-issue.dto';

import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';

import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'safety-platform',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

@Controller('issues')
export class IssueController {
  constructor(private issueService: IssueService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: CreateIssueDto, @Req() req: any) {
    return this.issueService.create(body, req.user);
  }

  // 🔥 PROTECTED
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: any) {
    return this.issueService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/assign')
  assignIssue(
    @Param('id') id: number,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.issueService.assignIssue(
      Number(id),
      body.userEmail,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/status')
  updateStatus(
    @Param('id') id: number,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.issueService.updateStatus(
      Number(id),
      body.status,
      req.user,
    );
  }

  @Get('stats')
  getStats() {
    return this.issueService.getStats();
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.issueService.remove(Number(id));
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return {
      message: 'File uploaded successfully',
      imagePath: file.path,
    };
  }

  @Get('dashboard')
  getDashboard() {
    return this.issueService.getDashboard();
  }
}
