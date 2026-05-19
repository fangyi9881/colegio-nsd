import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { to, subject, html } = req.body as { to?: string; subject?: string; html?: string };

  try {
    const data = await resend.emails.send({
      from: 'Dolores Dragons <onboarding@resend.dev>',
      to: to || 'basketnsd@gmail.com',
      subject: subject || 'Dolores Dragons',
      html: html || '',
    });
    res.status(200).json(data);
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
