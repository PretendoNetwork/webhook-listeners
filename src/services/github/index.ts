import express from 'express';
import githubMiddleware from '@/middleware/github';
import processIssue from '@/services/github/process-issue';
import processPullRequest from '@/services/github/process-pull-request';
import proxyDiscord from '@/services/github/proxy-discord';
import config from '@/config-manager';
import type { EventPayloadMap } from '@octokit/webhooks-types';

const router = express.Router();

router.post(config.github.webhook_path!, githubMiddleware, async (request: express.Request, response: express.Response): Promise<void> => {
	const event = request.headers['x-github-event'] as keyof EventPayloadMap;

	if (event === 'ping') {
		response.status(200).send('Pong');
		return;
	}

	if (request.body.repository && config.github.discord_webhook_repo_blacklist.includes(request.body.repository.full_name)) {
		response.status(200).send('Repository is blacklisted. No action taken.');
		return;
	}

	if (event === 'issues') {
		await processIssue(request, response);
		return;
	}

	if (event === 'pull_request') {
		await processPullRequest(request, response);
		return;
	}

	if (config.github.discord_webhook_url) {
		await proxyDiscord(request, response);
		return;
	}

	response.sendStatus(200);
});

export default router;