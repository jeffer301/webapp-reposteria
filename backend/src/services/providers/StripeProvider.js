const PaymentProvider = require('./PaymentProvider');

class StripeProvider extends PaymentProvider {
  async createPayment(orderData) {
    const { total, customerEmail, customerName, reference } = orderData;

    console.log('StripeProvider.createPayment() — pendiente de implementar');
    console.log('Requiere: npm install stripe');
    console.log('Variables de entorno: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET');
    console.log('Datos recibidos:', { total, customerEmail, customerName, reference });

    return {
      paymentUrl: null,
      reference,
      raw: null,
      error: 'Stripe no implementado — stub',
    };
  }

  async confirmPayment(webhookPayload) {
    console.log('StripeProvider.confirmPayment() — pendiente de implementar');
    console.log('Requiere verificar webhook signature con stripe.webhooks.constructEvent()');
    console.log('Datos recibidos:', webhookPayload);

    return { success: false, reference: null, status: 'pendiente' };
  }

  async getPaymentStatus(reference) {
    console.log('StripeProvider.getPaymentStatus() — pendiente de implementar');
    console.log('Requiere: stripe.paymentIntents.retrieve(reference)');
    console.log('Referencia:', reference);

    return { status: 'pendiente', amount: null };
  }
}

module.exports = StripeProvider;
