const { getProviderSingleton } = require('./providers/PaymentFactory');

const provider = getProviderSingleton();

const createPayment = async (orderData) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
  const API_URL = process.env.API_URL || 'http://localhost:3000';

  const enrichedData = {
    ...orderData,
    redirectUrl: orderData.redirectUrl || `${FRONTEND_URL}/pedido/${orderData.reference}`,
    confirmationUrl: orderData.confirmationUrl || `${API_URL}/api/pagos/confirm`,
  };

  return provider.createPayment(enrichedData);
};

const confirmPayment = async (webhookPayload) => {
  return provider.confirmPayment(webhookPayload);
};

const getPaymentStatus = async (reference) => {
  return provider.getPaymentStatus(reference);
};

module.exports = { createPayment, confirmPayment, getPaymentStatus };
