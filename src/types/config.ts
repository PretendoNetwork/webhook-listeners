export default interface Config {
	http: {
		port: number;
	};
	github: {
		webhook_path?: string;
		webhook_secret?: string;
		discord_webhook_url?: string;
		discord_webhook_repo_blacklist: string[];
		app?: {
			id: number;
			private_key_path: string;
			installation_id: number;
		}
	}
};

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PN_WEBHOOKS_CONFIG_GITHUB_PATH?: string;
			PN_WEBHOOKS_CONFIG_GITHUB_WEBHOOK_SECRET?: string;
			PN_WEBHOOKS_CONFIG_GITHUB_DISCORD_WEBHOOK_URL?: string;
			PN_WEBHOOKS_CONFIG_GITHUB_APP_ID?: string;
			PN_WEBHOOKS_CONFIG_GITHUB_APP_PRIVATE_KEY_PATH?: string;
			PN_WEBHOOKS_CONFIG_GITHUB_APP_INSTALLATION_ID?: string;
		}
	}
}