const PaymentProvider = require('./PaymentProvider');

class MercadoPagoProvider extends PaymentProvider {
  async createPayment(orderData) {
    const { total, customerEmail, customerName, reference } = orderData;

    console.log('MercadoPagoProvider.createPayment() — pendiente de implementar');
    console.log('Requiere: npm install mercadopago');
    console.log('Variables de entorno: MERCADOPAGO_ACCESS_TOKEN');
    console.log('Datos recibidos:', { total, customerEmail, customerName, reference });

    return {
      paymentUrl: null,
      reference,
      raw: null,
      error: 'MercadoPago no implementado — stub',
    };
  }

  async confirmPayment(webhookPayload) {
    console.log('MercadoPagoProvider.confirmPayment() — pendiente de implementar');
    console.log('Requiere verificar webhook IPN (notificación de pago)');
    console.log('Endpoint recomendado: POST /api/pagos/confirm');
    console.log('Datos recibidos:', webhookPayload);

    return { success: false, reference: null, status: 'pendiente' };
  }

  async getPaymentStatus(reference) {
    console.log('MercadoPagoProvider.getPaymentStatus() — pendiente de implementar');
    console.log('Requiere: mercadopago.payment.get(reference)');
    console.log('Referencia:', reference);

    return { status: 'pendiente', amount: null };
  }
}

module.exports = MercadoPagoProvider;
