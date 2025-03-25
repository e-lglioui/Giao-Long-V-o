import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventsService } from '../providers/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@ApiTags('events')
@Controller('events')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Event created successfully' })
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  async findAll(@Query() filters: any) {
    return this.eventsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by id' })
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update event' })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @Roles(Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Delete event' })
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/register/:userId')
  @ApiOperation({ summary: 'Register participant for event' })
  async registerParticipant(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('role') role: string
  ) {
    return this.eventsService.registerParticipant(id, userId, role);
  }

  @Put(':id/participants/:userId/results')
  @Roles(Role.SCHOOL_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Update participant results' })
  async updateParticipantResults(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() results: any
  ) {
    return this.eventsService.updateParticipantResults(id, userId, results);
  }

  @Get(':id/statistics')
  @Roles(Role.SCHOOL_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get event statistics' })
  async getEventStatistics(@Param('id') id: string) {
    return this.eventsService.getEventStatistics(id);
  }
} 