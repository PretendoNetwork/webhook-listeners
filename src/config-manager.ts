import dotenv from 'dotenv';
import type Config from '@/types/config';

dotenv.config();

// * Add to blacklist using environment variables named like
// * "PN_WEBHOOKS_CONFIG_GITHUB_DISCORD_WEBHOOK_REPO_BLACKLIST_OWNER_REPONAME"
// * Such as PN_WEBHOOKS_CONFIG_GITHUB_DISCORD_WEBHOOK_REPO_BLACKLIST_PretendoNetwork_account
const githubRepoBlacklist = Object.keys(process.env)
	.filter(variable => variable.startsWith('PN_WEBHOOKS_CONFIG_GITHUB_DISCORD_WEBHOOK_REPO_BLACKLIST_'))
	.map(variable => variable.substring(57).split('_').join('/')); // * Convert strings like "PretendoNetwork_account" to "PretendoNetwork/account"

const config: Config = {
	http: {
		port: parseInt(process.env.PN_WEBHOOKS_CONFIG_HTTP_PORT ?? '9999')
	},
	github: {
		webhook_path: process.env.PN_WEBHOOKS_CONFIG_GITHUB_PATH,
		discord_webhook_url: process.env.PN_WEBHOOKS_CONFIG_GITHUB_DISCORD_WEBHOOK_URL,
		discord_webhook_repo_blacklist: githubRepoBlacklist
	}
};


if (
	process.env.PN_WEBHOOKS_CONFIG_GITHUB_APP_ID &&
	process.env.PN_WEBHOOKS_CONFIG_GITHUB_APP_PRIVATE_KEY_PATH &&
	process.env.PN_WEBHOOKS_CONFIG_GITHUB_APP_INSTALLATION_ID
) {
	config.github.app = {
		id: parseInt(process.env.PN_WEBHOOKS_CONFIG_GITHUB_APP_ID),
		private_key_path: process.env.PN_WEBHOOKS_CONFIG_GITHUB_APP_PRIVATE_KEY_PATH,
		installation_id: parseInt(process.env.PN_WEBHOOKS_CONFIG_GITHUB_APP_INSTALLATION_ID)
	};
}

export default config;