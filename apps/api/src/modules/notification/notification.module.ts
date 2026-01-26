import { Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationRouter } from './notification.router'
import { SocketModule } from '../socket/socket.module' // Import SocketModule to use SocketGateway
import { SharedModule } from '@/shared/shared.module' // To use EmailService (exported by SharedModule?)
// Actually EmailService is in SharedModule but check exports.
// SharedModule exports [EmailService].

@Module({
  imports: [SocketModule, SharedModule],
  providers: [NotificationService, NotificationRouter],
  exports: [NotificationService],
})
export class NotificationModule {}
