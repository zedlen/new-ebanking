import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserPartnersRepository } from '@middleware/domain/repositories/userPartners.interface';

@Injectable()
export class AssertPartnerAccessService {
  constructor(
    private readonly userPartnersRepository: UserPartnersRepository,
  ) {}

  async assert(userId: string, partnerId: string): Promise<void> {
    const assignment = await this.userPartnersRepository.findOne({
      customerId: userId,
    });
    if (!assignment)
      throw new NotFoundException('User partner assignment not found');
    if (
      !assignment.allPartners &&
      !assignment.asignedPartners?.includes(partnerId)
    ) {
      throw new ForbiddenException('Partner access denied');
    }
  }
}
