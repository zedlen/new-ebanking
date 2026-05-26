import { AffiliationRequest } from '@middleware/domain/entities/affiliationRequest.entity';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { AffiliationRequestRepository } from '@middleware/domain/repositories/affiliationRequest.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AffiliationRequestService {
  constructor(
    private readonly affiliationRequestRepository: AffiliationRequestRepository,
  ) {}

  getCustomerAffiliationsRequest(
    customerId: string,
    app: string,
    pagination: Pagination,
  ) {
    return this.affiliationRequestRepository.find(
      { parent_id: customerId, app },
      pagination,
    );
  }

  createCustomerAffiliationsRequest(data: AffiliationRequest) {
    return this.affiliationRequestRepository.save(data);
  }

  updateCustomerAffiliationsRequest(
    id: string,
    data: Partial<AffiliationRequest>,
  ) {
    return this.affiliationRequestRepository.update(id, data);
  }

  deleteCustomerAffiliationsRequest(id: string) {
    return this.affiliationRequestRepository.softDelete(id);
  }

  findOne(query: Partial<AffiliationRequest>) {
    return this.affiliationRequestRepository.findOne(query);
  }
}
