import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User, UserRole, Product } from './models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private users = new BehaviorSubject<User[]>([
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'seller' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'buyer' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'seller' }
  ]);
  private products = new BehaviorSubject<Product[]>([
    { id: 1, name: 'Laptop', description: 'Gaming Laptop', price: 1200, quantity: 5, sellerId: 1 },
    { id: 2, name: 'Phone', description: 'Smartphone', price: 800, quantity: 10, sellerId: 3 }
  ]);
  private nextUserId = 4;
  private nextProductId = 3;

  users$ = this.users.asObservable();
  products$ = this.products.asObservable();

  // Cache for repeated user check
  private userCache = new Map<string, User>();

  addUser(name: string, email: string, role: UserRole): { user: User, isRepeated: boolean } {
    const existing = this.users.value.find(u => u.email === email);
    if (existing) {
      return { user: existing, isRepeated: true };
    }
    const user: User = { id: this.nextUserId++, name, email, role };
    this.users.next([...this.users.value, user]);
    this.userCache.set(email, user);
    return { user, isRepeated: false };
  }

  deleteUser(id: number) {
    this.users.next(this.users.value.filter(u => u.id !== id));
    // Optionally remove products for this seller
    this.products.next(this.products.value.filter(p => p.sellerId !== id));
  }

  addProduct(product: Omit<Product, 'id'>) {
    const newProduct: Product = { ...product, id: this.nextProductId++ };
    this.products.next([...this.products.value, newProduct]);
  }

  buyProduct(productId: number, quantity: number): boolean {
    const products = this.products.value.map(p => {
      if (p.id === productId && p.quantity >= quantity) {
        return { ...p, quantity: p.quantity - quantity };
      }
      return p;
    });
    const found = this.products.value.find(p => p.id === productId && p.quantity >= quantity);
    if (found) {
      this.products.next(products);
      return true;
    }
    return false;
  }

  // For repeated user popup
  isRepeatedUser(email: string): boolean {
    return !!this.users.value.find(u => u.email === email);
  }
}
