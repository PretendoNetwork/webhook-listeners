import crypto from 'node:crypto';
import express from 'express';
import config from '@/config-manager';

export default async function githubMiddleware(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	if (!request.rawBody) {
		response.status(400).send('Missing or invalid post body');
		return;
	}

	if (config.github.webhook_secret) {
		const sha256 = request.get('x-hub-signature-256');

		if (!sha256) {
			response.status(400).send('Missing or invalid signature');
			return;
		}

		const [algorithm, signature] = sha256.split('=');
		const hmac = crypto.createHmac(algorithm, config.github.webhook_secret).update(request.rawBody).digest('hex');

		if (hmac !== signature) {
			response.status(400).send('Missing or invalid signature');
			return;
		}
	}

	return next();
}