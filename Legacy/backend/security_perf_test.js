import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4000/api' });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Extremely long string
const longString = 'a'.repeat(10000);

// XSS and NoSQL injection payloads
const securityPayloads = {
  xss: '<script>alert("xss")</script>',
  nosql: { $gt: '' },
  emoji: '🔥🎂✨💖'
};

const customerPayload = {
  name: `John Doe ${securityPayloads.xss} ${securityPayloads.emoji}`,
  phone: '0987654321', // must pass validation
  email: 'john@example.com',
  address: `123 Fake St ${securityPayloads.xss}`,
  pincode: '456010'
};

async function runTests() {
  console.time('Total Test Duration');
  
  const orderNumbers = [];

  // Performance: Place 5 consecutive orders
  console.log('--- Placing 5 Orders ---');
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    try {
      const res = await api.post('/orders', {
        items: [{ productId: '600000000000000000000000', qty: 1, name: 'Fallback', priceAtOrder: 249 }],
        customer: customerPayload,
        deliveryMethod: 'post'
      });
      console.log(`Order ${i + 1} placed in ${Date.now() - start}ms: #${res.data.orderNumber}`);
      orderNumbers.push(res.data.orderNumber);
    } catch (err) {
      console.error(`Order ${i + 1} failed:`, err.response?.data || err.message);
    }
  }

  // Performance: Open tracking repeatedly
  console.log('\n--- Tracking Orders (5 requests) ---');
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    try {
      await api.post('/orders/track', {
        orderNumber: orderNumbers[0],
        phone: customerPayload.phone
      });
      console.log(`Tracking request ${i + 1} completed in ${Date.now() - start}ms`);
    } catch (err) {
      console.error(`Tracking request ${i + 1} failed:`, err.response?.data || err.message);
    }
  }
  
  console.timeEnd('Total Test Duration');
}

runTests();
