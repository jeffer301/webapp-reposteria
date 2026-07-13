import { Component, inject, output } from '@angular/core';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  cart = inject(CartService);
  auth = inject(AuthService);
  readonly toggleCart = output();
  readonly toggleAuth = output();
  readonly toggleAdmin = output();
}
