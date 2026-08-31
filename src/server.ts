import express from 'express';
import github from '@/services/github';
import config from '@/config-manager';
import { formatBytes } from '@/util';

const app = express();

app.use(express.json({
	limit: '25mb', // Increase the limit to the GitHub payload cap: https://docs.github.com/en/webhooks/webhook-events-and-payloads#payload-cap
	verify: (request, _response, buffer) => {
		// Only the GitHub webhook route needs the raw body (for HMAC signature verification)
		if (!config.github.webhook_path || request.url !== config.github.webhook_path) {
			return;
		}

		console.log(`Request URL: ${request.url}, Request Method: ${request.method}, Request Size: ${formatBytes(buffer.length)}`);

		if (buffer && buffer.length) {
			request.rawBody = buffer;
		}
	}
}));

if (config.github.webhook_path) {
	app.use(github);
}

async function main(): Promise<void> {
	app.listen(config.http.port);
}

main().catch(console.error);