import { customerService } from './customer.service';

export const customersService = {
  async getAll() {
    return customerService.listCustomers();
  }
};
