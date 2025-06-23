// SMS Service (Twilio example)
// In a real application, you would integrate with Twilio or another SMS provider

export const sendSMS = async (phoneNumber, message) => {
  try {
    // In development mode, just log the SMS
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 SMS (Development Mode):');
      console.log(`To: ${phoneNumber}`);
      console.log(`Message: ${message}`);
      console.log('---');
      
      return {
        success: true,
        messageId: 'dev-sms-' + Date.now()
      };
    }

    // Twilio implementation example
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // const result = await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
    
    // return {
    //   success: true,
    //   messageId: result.sid
    // };

    // For now, simulate successful SMS sending
    return {
      success: true,
      messageId: 'sim-' + Date.now()
    };
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

// Send OTP via SMS
export const sendOTPSMS = async (phoneNumber, otp) => {
  const message = `Your verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
  return sendSMS(phoneNumber, message);
};

// Send security alert via SMS
export const sendSecuritySMS = async (phoneNumber, alertMessage) => {
  const message = `Security Alert: ${alertMessage}. If this wasn't you, please secure your account immediately.`;
  return sendSMS(phoneNumber, message);
};