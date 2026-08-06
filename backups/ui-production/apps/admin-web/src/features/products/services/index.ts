import { productService } from './product.service';

export const productsService = {
  async getAll() {
    return productService.listProducts();
  }
};
