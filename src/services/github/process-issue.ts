import express from 'express';
import octokit from '@/services/github/bot';
import { increaseAndGetGitHubUserProblemsCount } from '@/database';
import { ordinal } from '@/util';
import type { EventPayloadMap } from '@octokit/webhooks-types';

const TITLE_CHECK_REGEX = /\[\w+\]: .+/;
const CHECKED_FOR_EXISTING_REGEX = /- \[[xX]\] I have checked the repository for duplicate issues\./;
const DETAILS_REGEX = /###.*?\n[\s\S]*?###(.*)?\n([\s\S]*?)### Any other details to share\? \(OPTIONAL\)/;

export default async function processIssue(request: express.Request, response: express.Response): Promise<void> {
	const payload = request.body as EventPayloadMap['issues'];

	if (payload.action !== 'opened') {
		response.sendStatus(200);
		return;
	}

	const issues: string[] = [];

	if (!payload.issue.title.match(TITLE_CHECK_REGEX)) {
		issues.push('Invalid issue title. Did you use a provided template? Issues must be made with titles in the format `[Type]: Title`');
	}

	if (!payload.issue.body) {
		issues.push('Missing body. Please do not make title-only issues. Adding details in the issue body help us understand the problem faster!');
	}

	if (!payload.issue.body?.match(CHECKED_FOR_EXISTING_REGEX)) {
		// TODO - Run a search to see if there are similar issues? Unsure how to determine "similar" though
		issues.push('Failed to find "checked for duplicates" verification. Please ensure you have verified that there are no other open issues similar to this one.');
	}

	// TODO - How safe is this section check?
	if (payload.issue.body) {
		const matches = payload.issue.body.match(DETAILS_REGEX);

		if (!matches) {
			issues.push('The main section appears to be empty or missing. Did you fill it out? Adding details in the issue body help us understand the problem faster!');
		} else {
			const section = matches[1]?.trim();
			const sectionBody = matches[2]?.trim();

			if (!sectionBody || sectionBody === '_No response_') {
				issues.push(`The \`${section}\` section appears to be empty. Did you fill it out? Adding details in the issue body help us understand the problem faster!`);
			}
		}
	}

	// TODO - Check for error codes and respond with information on them?

	if (issues.length !== 0) {
		const problems = increaseAndGetGitHubUserProblemsCount(payload.issue.user.id);
		let comment = 'Thank you for opening this issue! I have detected the following possible issues with your issue:\n';

		comment += '\n';

		for (const issue of issues) {
			comment += `- ${issue}\n`;
		}

		comment += '\n';
		comment += 'While we always appreciate users opening issues to try and help improve our services, it\'s important to follow the [Contribution Guidelines](https://github.com/PretendoNetwork/.github/blob/master/.github/CONTRIBUTING.md) to ensure smooth interactions!\n';
		comment += '\n';
		comment += 'Please refresh yourself on these guidelines for future issues!\n';

		// * Only show this after a certain amount of bad contributions, as to not scare new people
		if (problems >= 3) {
			comment += '\n';
			comment += `This is the ${ordinal(problems)} time I have detected errors in your contributions. Please be aware that continued instances of contributions with errors may result in future contributions being blocked.\n`;
		}

		comment += '\n';
		comment += '***Note: This process was automated. If you believe this was done in error, please ignore and consider filing a bug report on the [`webhook-listeners`](https://github.com/PretendoNetwork/webhook-listeners/issues/new/choose) repository.***';

		await octokit.issues.createComment({
			owner: payload.repository.owner.login,
			repo: payload.repository.name,
			issue_number: payload.issue.number,
			body: comment
		});
	}

	response.sendStatus(200);
}