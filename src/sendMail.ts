import nodemailer from "nodemailer"
import { config } from 'dotenv';

config({ path: '../.env' })

const sendMail = (to: string, subject: string, body: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: to,
    subject: subject,
    html: body
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

const generateEmailBody = (products: Record<string, any>[], maxPrice: number): string => {
  return products.map((item) => {
    const monetaryPrice = item.price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    const bold = item.price <= maxPrice ? `style='font-weight: bold;'` : '';

    return `<ul>
              <li><a href='${item.url}'>${item.title}</a></li>
              <li ${bold} >Price: ${monetaryPrice}</li>
              <li>Store: ${item.store}</li>
            </ul>`;
  }).join('');
}

export { sendMail, generateEmailBody }