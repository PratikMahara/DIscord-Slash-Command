import nacl from 'tweetnacl';

export function verifyDiscordRequest(req, res, next) {
  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const rawBody = req.rawBody;

  if (!signature || !timestamp || !rawBody) {
    console.log('Missing headers:', { signature, timestamp, hasBody: !!rawBody });
    return res.status(401).send('Bad request');
  }

  try {
    const isValid = nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody),
      Buffer.from(signature, 'hex'),
      Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex')
    );

    if (!isValid) {
      console.log('Invalid signature');
      return res.status(401).send('Invalid signature');
    }

    next();
  } catch (err) {
    console.error('Signature verification error:', err.message);
    return res.status(401).send('Verification failed');
  }
}