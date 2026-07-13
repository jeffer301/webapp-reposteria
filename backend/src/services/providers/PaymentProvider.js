class PaymentProvider {
  async createPayment(orderData) {
    throw new Error('Metodo createPayment() debe ser implementado por el provider');
  }

  async confirmPayment(webhookPayload) {
    throw new Error('Metodo confirmPayment() debe ser implementado por el provider');
  }

  async getPaymentStatus(reference) {
    throw new Error('Metodo getPaymentStatus() debe ser implementado por el provider');
  }
}

module.exports = PaymentProvider;
