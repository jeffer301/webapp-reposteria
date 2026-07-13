import { Component, inject, output } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
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
  private router = inject(Router);
  readonly toggleCart = output();
  readonly toggleAuth = output();

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
      });
    }
  }
}
