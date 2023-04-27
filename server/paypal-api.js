const fetch = require('node-fetch-commonjs');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
const base = 'https://api-m.sandbox.paypal.com';

exports.createOrder = async function (body) {
  const accessToken = await generateAccessToken();

  const url = `${base}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      UUID: body.UUID,
      purchase_units: [
        {
          amount: {
            currency_code: 'EUR',
            value: body.value,
          },
        },
      ],
    }),
  });
  // console.log(response);
  return handleResponse(response);
};

exports.capturePayment = async function (orderId) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleResponse(response);
};

const generateAccessToken = async function () {
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_APP_SECRET).toString(
    'base64'
  );

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'post',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const jsonData = await handleResponse(response);
  return jsonData.access_token;
};

async function handleResponse(response) {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  const errorMessage = await response.text();
  throw new Error(errorMessage);
}
