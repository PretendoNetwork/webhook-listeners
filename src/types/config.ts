export default interface Config {
	http: {
		port: number;
	};
	github: {
		webhook_path?: string;
		discord_webhook_url?: string;
		discord_webhook_repo_blacklist: string[];
	}
};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PN_WEBHOOKS_CONFIG_GITHUB_PATH?: string;
			PN_WEBHOOKS_CONFIG_GITHUB_DISCORD_WEBHOOK_URL?: string;
		}
	}
}