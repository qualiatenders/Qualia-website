// Payment adapter.
// mode 'demo'  → nothing is charged; the flow continues after a short delay.
// mode 'mollie'→ POSTs the order to your backend, which creates a Mollie payment
//                (method: ideal | applepay | paypal) and returns its checkoutUrl.
//                See annodomini/README.md for the server snippet.
window.ADPay = {
  mode: 'demo',
  endpoint: '/api/payments',
  methods: [
    { id: 'applepay', name: 'Apple Pay', sub: 'Face ID · direct', logo: 'Pay', style: 'background:#000;color:#fff', button: 'Betaal met <b>Apple Pay</b>', cls: 'apple' },
    { id: 'ideal', name: 'iDEAL', sub: 'Alle Nederlandse banken', logo: 'iDEAL', style: 'background:#fff;border:1px solid #e5e0d6;color:#CC0066', button: 'Betaal met <b>iDEAL</b>' },
    { id: 'paypal', name: 'PayPal', sub: 'Betaal met uw PayPal-account', logo: 'PayPal', style: 'background:#fff;border:1px solid #e5e0d6;color:#003087;font-style:italic', button: 'Betaal met <b>PayPal</b>' },
  ],
  // Apple Pay only shows up where the device can actually pay with it.
  available(id) {
    if (id !== 'applepay') return true;
    return this.mode === 'demo' || !!(window.ApplePaySession && ApplePaySession.canMakePayments());
  },
  async start(order) {
    if (this.mode === 'demo') {
      await new Promise(r => setTimeout(r, 1400));
      return { status: 'paid', id: 'demo_' + Date.now().toString(36) };
    }
    const res = await fetch(this.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
    if (!res.ok) throw new Error('Betaling kon niet worden gestart');
    const { checkoutUrl } = await res.json();
    location.href = checkoutUrl; // Mollie returns the customer to redirectUrl
    return new Promise(() => {});
  },
};
