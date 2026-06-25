import { createVerify } from 'crypto';

export function verifyDiscordRequest(req, res, next) {
  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const rawBody = req.rawBody;

  console.log('=== Discord Verification ===');
  console.log('signature:', signature);
  console.log('timestamp:', timestamp);
  console.log('rawBody:', rawBody);
  console.log('PUBLIC_KEY:', process.env.DISCORD_PUBLIC_KEY);

  if (!signature || !timestamp || !rawBody) {
    console.log('❌ Missing headers');
    return res.status(401).send('Bad request');
  }

  try {
    const verify = createVerify('EdDSA');
    verify.update(Buffer.from(timestamp + rawBody));
    const isValid = verify.verify(
      {
        key: Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex'),
        format: 'der',
        type: 'spki',
      },
      Buffer.from(signature, 'hex')
    );

    if (!isValid) {
      console.log('❌ Invalid signature');
      return res.status(401).send('Invalid signature');
    }

    console.log('✅ Signature valid');
    next();
  } catch (err) {
    console.error('❌ Verification error:', err.message);
    return res.status(401).send('Verification failed');
  }
}