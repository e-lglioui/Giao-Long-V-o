import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from '../providers/notifications.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NotificationStatus } from '../schemas/notification.schema';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async getUserNotifications(
    @Req() req: any,
    @Query('status') status?: NotificationStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.notificationsService.getUserNotifications(
      req.user.id,
      status,
      limit,
      offset
    );
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @Req() req: any,
    @Param('id') notificationId: string
  ) {
    return this.notificationsService.markAsRead(
      req.user.id,
      notificationId
    );
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
} 