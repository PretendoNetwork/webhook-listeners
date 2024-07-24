import express from 'express';
import proxyDiscord from '@/services/github/proxy-discord';
import config from '@/config-manager';
import type { EventPayloadMap } from '@octokit/webhooks-types';

const router = express.Router();

router.post(config.github.webhook_path!, async (request: express.Request, response: express.Response): Promise<void> => {
	const event = request.headers['x-github-event'] as keyof EventPayloadMap;

	if (event === 'ping') {
		response.status(200).send('Pong');
		return;
	}

	if (config.github.discord_webhook_url) {
		await proxyDiscord(request, response);
		return;
	}

	response.sendStatus(200);
});

export default router;