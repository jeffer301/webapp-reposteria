import { Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  imports: [RouterLink],
})
export class Navbar {
  cart = inject(CartService);
  auth = inject(AuthService);
  readonly toggleCart = output();
  readonly toggleAuth = output();
}
