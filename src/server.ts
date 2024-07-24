import express from 'express';
import github from '@/services/github';
import config from '@/config-manager';

const app = express();

app.use(express.json({
	verify: (request, response, buffer) => {
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