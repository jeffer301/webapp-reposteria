const PaymentProvider = require('./PaymentProvider');

const WOMPI_API_URL = process.env.WOMPI_API_URL || 'https://sandbox.wompi.co/v1';
const WOMPI_PUB_KEY = process.env.WOMPI_PUBLIC_KEY || '';
const WOMPI_PRV_KEY = process.env.WOMPI_PRIVATE_KEY || '';

class WompiProvider extends PaymentProvider {
  async createPayment(orderData) {
    const { total, customerEmail, customerName, reference, redirectUrl, confirmationUrl } = orderData;

    if (!WOMPI_PRV_KEY) {
      console.log('Wompi no configurado. Usando modo simulación.');
      return {
        paymentUrl: null,
        reference,
        raw: { status: 'SIMULATED', data: { id: `sim-${Date.now()}`, reference } },
      };
    }

    try {
      const totalCentavos = Math.round(total * 100);
      const body = {
        amount_in_cents: totalCentavos,
        currency: 'COP',
        reference,
        customer_email: customerEmail,
        customer_full_name: customerName,
        payment_method: { type: 'CARD' },
        redirect_url: redirectUrl,
        confirmation_url: confirmationUrl,
      };

      const res = await fetch(`${WOMPI_API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WOMPI_PRV_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      return {
        paymentUrl: data.data?.url_pago || null,
        reference,
        raw: data,
      };
    } catch (err) {
      console.error('Error al crear transacción Wompi:', err.message);
      return { paymentUrl: null, reference, raw: null, error: err.message };
    }
  }

  async confirmPayment(webhookPayload) {
    const { data } = webhookPayload;
    if (!data?.transaction?.reference) {
      return { success: false, reference: null, status: 'pendiente' };
    }

    const statusMap = {
      APPROVED: 'pagado',
      DECLINED: 'rechazado',
      VOIDED: 'rechazado',
      ERROR: 'error',
      PENDING: 'pendiente',
    };

    return {
      success: data.transaction.status === 'APPROVED',
      reference: data.transaction.reference,
      status: statusMap[data.transaction.status] || 'pendiente',
      raw: webhookPayload,
    };
  }

  async getPaymentStatus(reference) {
    if (!WOMPI_PRV_KEY) {
      return { status: 'SIMULATED', amount: null };
    }

    try {
      const res = await fetch(`${WOMPI_API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${WOMPI_PRV_KEY}` },
      });
      const data = await res.json();

      const tx = data.data?.find((t) => t.reference === reference);
      if (!tx) return { status: 'not_found', amount: null };

      const statusMap = {
        APPROVED: 'pagado',
        DECLINED: 'rechazado',
        VOIDED: 'rechazado',
        ERROR: 'error',
        PENDING: 'pendiente',
      };

      return {
        status: statusMap[tx.status] || 'pendiente',
        amount: tx.amount_in_cents ? tx.amount_in_cents / 100 : null,
        raw: tx,
      };
    } catch (err) {
      console.error('Error al verificar transacción Wompi:', err.message);
      return { status: 'error', amount: null, error: err.message };
    }
  }
}

module.exports = WompiProvider;
