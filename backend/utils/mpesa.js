const axios = require('axios');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
    
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting M-Pesa access token:', error.response?.data || error.message);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  async initiateSTKPush(phone, amount, accountReference, transactionDesc) {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

      // Format phone number (remove + and leading 0, add 254)
      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      const requestBody = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: this.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('M-Pesa STK Push error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment'
      };
    }
  }

  async querySTKStatus(checkoutRequestID) {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.getTimestamp();
      const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestID
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('M-Pesa query error:', error.response?.data || error.message);
      throw error;
    }
  }

  getTimestamp() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}

module.exports = new MpesaService();
