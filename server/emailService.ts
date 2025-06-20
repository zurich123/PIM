import nodemailer from 'nodemailer';
import type { Product } from '@shared/schema';

// Create a transporter using Ethereal Email (free testing service)
const createTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export async function sendNewProductNotification(product: Product) {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: '"Product Management System" <noreply@productflow.com>',
      to: 'vmandava18@gmail.com',
      subject: `New Product Added: ${product.productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #0088FE; padding-bottom: 10px;">
            New Product Added to Catalog
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0088FE; margin-top: 0;">${product.productName}</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Product ID:</td>
                <td style="padding: 8px 0;">${product.productId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Product Type:</td>
                <td style="padding: 8px 0;">${product.productType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Format:</td>
                <td style="padding: 8px 0;">${product.format}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Lifecycle Status:</td>
                <td style="padding: 8px 0;">
                  <span style="background-color: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                    ${product.lifecycleStatus}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Membership Flag:</td>
                <td style="padding: 8px 0;">${product.membershipFlag ? 'Yes' : 'No'}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #e3f2fd; border-left: 4px solid #0088FE;">
            <p style="margin: 0; color: #555;">
              This product was added to the ProductFlow system on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 12px; margin: 0;">
              This is an automated notification from ProductFlow Product Management System
            </p>
          </div>
        </div>
      `,
      text: `
        New Product Added to Catalog
        
        Product Name: ${product.productName}
        Product ID: ${product.productId}
        Product Type: ${product.productType}
        Format: ${product.format}
        Lifecycle Status: ${product.lifecycleStatus}
        Membership Flag: ${product.membershipFlag ? 'Yes' : 'No'}
        
        Added on: ${new Date().toLocaleString()}
        
        This is an automated notification from ProductFlow Product Management System.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email notification sent successfully');
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
    
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}