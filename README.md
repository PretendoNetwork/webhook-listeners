# Webook Listeners

Microservice for consuming webhook events from various services

## Services

This microservice listens for webhooks from various services for various reasons. Below is a list of all services supported by this microservice and what features it implements.

For security purposes webhook endpoints should never be known to anyone but the service. Thus this microservice does not define any routes itself. Instead routes should come from configurations.

### GitHub - Features

- Filters private repositories from having their events sent to a Discord webhook channel
- Validates that newly opened issues have followed the contribution guidelines. Will auto-respond if any errors are found
- Validates that newly opened pull requests have followed the contribution guidelines. Will auto-respond if any errors are found

### GitHub - Setup

| Environment Variable Name                        | Purpose                                                                                          | Optional |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------- |
| `PN_WEBHOOKS_CONFIG_GITHUB_PATH`                 | Defines the route for consuming GitHub webhooks. If not set, will not listen for GitHub webhooks | Yes      |
| `PN_WEBHOOKS_CONFIG_GITHUB_WEBHOOK_SECRET`       | The secret for validating webhook signatures. If not set, will validate `POST` bodies webhooks   | Yes      |
| `PN_WEBHOOKS_CONFIG_GITHUB_APP_ID`               | GitHub app ID. If not set then the auto-responding bot will not be enabled                       | Yes      |
| `PN_WEBHOOKS_CONFIG_GITHUB_APP_PRIVATE_KEY_PATH` | GitHub app private key path. If not set then the auto-responding bot will not be enabled         | Yes      |
| `PN_WEBHOOKS_CONFIG_GITHUB_APP_INSTALLATION_ID`  | GitHub app installation ID. If not set then the auto-responding bot will not be enabled          | Yes      |