
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { User, Product } from './models';
import { CommonModule, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  currentUser: User | null = null;
  products$: Observable<Product[]>;
  sellerProducts: Product[] = [];
  productForm: FormGroup;
  buyForms: { [productId: number]: FormGroup } = {};
  buyMessage = '';

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.products$ = this.userService.products$;
    const userStr = localStorage.getItem('currentUser');
    this.currentUser = userStr ? JSON.parse(userStr) : null;

    // For sellers, filter their products
    this.products$.subscribe(products => {
      if (this.currentUser?.role === 'seller') {
        this.sellerProducts = products.filter(p => p.sellerId === this.currentUser?.id);
      }
      if (this.currentUser?.role === 'buyer') {
        // Setup buy forms for each product
        products.forEach(product => {
          if (!this.buyForms[product.id]) {
            this.buyForms[product.id] = this.fb.group({
              quantity: [1, [Validators.required, Validators.min(1), Validators.max(product.quantity)]]
            });
          }
        });
      }
    });

    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  onAddProduct() {
    if (this.productForm.valid && this.currentUser) {
      const { name, description, price, quantity } = this.productForm.value;
      this.userService.addProduct({
        name,
        description,
        price: +price,
        quantity: +quantity,
        sellerId: this.currentUser.id
      });
      this.productForm.reset({ name: '', description: '', price: 0, quantity: 1 });
    }
  }

  onBuyProduct(productId: number) {
    const form = this.buyForms[productId];
    if (form && form.valid) {
      const quantity = +form.value.quantity;
      const success = this.userService.buyProduct(productId, quantity);
      this.buyMessage = success ? 'Purchase successful!' : 'Not enough quantity available.';
      form.reset({ quantity: 1 });
      setTimeout(() => this.buyMessage = '', 2000);
    }
  }
}
