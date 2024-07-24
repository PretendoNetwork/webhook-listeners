import axios from 'axios';
import express from 'express';
import config from '@/config-manager';

export default async function proxyDiscord(request: express.Request, response: express.Response): Promise<void> {
	const { repository } = request.body;

	if (!repository) {
		response.status(400).send('No repository information found in payload.');
		return;
	}

	if (repository.private) {
		response.status(200).send('Repository is private. No action taken.');
		return;
	}

	try {
		const headers = { ...request.headers };
		delete headers.host;

		await axios.post(config.github.discord_webhook_url!, request.body, {
			headers
		});

		response.status(200).send('Event forwarded to Discord.');
	} catch (error) {
		console.error('Error forwarding to Discord:', error);
		response.status(500).send('Error forwarding to Discord.');
	}
}