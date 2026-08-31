import express from 'express';
import github from '@/services/github';
import config from '@/config-manager';

const app = express();

app.use(express.json({
	limit: '256kb', // Increase the limit to 256kb, we need to handle GitHub webhook payloads that can be larger than the default limit of 100kb
	verify: (request, _response, buffer) => {
		// Only the GitHub webhook route needs the raw body (for HMAC signature verification)
		if (!config.github.webhook_path || request.url !== config.github.webhook_path) {
			return;
		}

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