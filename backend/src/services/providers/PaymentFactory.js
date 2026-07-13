const WompiProvider = require('./WompiProvider');
const StripeProvider = require('./StripeProvider');
const MercadoPagoProvider = require('./MercadoPagoProvider');

const PROVIDERS = {
  wompi: WompiProvider,
  stripe: StripeProvider,
  mercadopago: MercadoPagoProvider,
};

let instance = null;

const getProvider = (name) => {
  const providerName = name || process.env.PAYMENT_PROVIDER || 'wompi';
  const normalized = providerName.toLowerCase().trim();

  const ProviderClass = PROVIDERS[normalized];
  if (!ProviderClass) {
    console.warn(
      `PaymentProvider "${providerName}" no es válido. Usando wompi por defecto.\n` +
      `Valores válidos: ${Object.keys(PROVIDERS).join(', ')}`
    );
    return new WompiProvider();
  }

  return new ProviderClass();
};

const getProviderSingleton = (name) => {
  if (!instance) {
    instance = getProvider(name);
  }
  return instance;
};

module.exports = { getProvider, getProviderSingleton };
