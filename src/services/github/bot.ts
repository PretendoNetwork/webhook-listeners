import fs from 'fs-extra';
import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import config from '@/config-manager';

let octokit: Octokit | undefined;

if (config.github.app) {
	const privateKey = fs.readFileSync(config.github.app.private_key_path, {
		encoding: 'utf8'
	});

	octokit = new Octokit({
		authStrategy: createAppAuth,
		auth: {
			appId: config.github.app.id,
			privateKey: privateKey,
			installationId: config.github.app.installation_id,
		},
	});
}

export default octokit;