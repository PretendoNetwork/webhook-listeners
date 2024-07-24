import express from 'express';
import octokit from '@/services/github/bot';
import { increaseAndGetGitHubUserProblemsCount } from '@/database';
import { ordinal } from '@/util';
import type { EventPayloadMap } from '@octokit/webhooks-types';

const COMMIT_MESSAGE_REGEX = /.*: .+/;
const READ_COC_REGEX = /- \[[xX]\] I have read and agreed to the/;
const READ_GUIDELINES_REGEX = /- \[[xX]\] I have read and complied with the/;
const ISSUE_APPROVED_REGEX = /- \[[xX]\] What I'm implementing was an/;
const TESTED_CHANGES_REGEX = /- \[[xX]\] I have tested all of my changes\./;

export default async function processPullRequest(request: express.Request, response: express.Response): Promise<void> {
	const payload = request.body as EventPayloadMap['pull_request'];

	if (payload.action !== 'opened') {
		response.sendStatus(200);
		return;
	}

	const { data: commits } = await octokit.pulls.listCommits({
		owner: payload.pull_request.base.repo.owner.login,
		repo: payload.pull_request.base.repo.name,
		pull_number: payload.pull_request.number
	});

	// * Check for any commits whose messages don't match the "type: message" structure
	const badCommits = commits
		.filter(({ commit }) => !COMMIT_MESSAGE_REGEX.test(commit.message))
		.map(({ sha, commit }) => ({
			message: commit.message.replace(/[\n\r]/g, ' '),
			hash: sha.substring(0, 7), // * Only get the short hash
		}));

	const issues: string[] = [];

	if (!payload.pull_request.body?.match(READ_COC_REGEX)) {
		issues.push('Failed to find "Code of Conduct" verification. Please ensure you have read our [Code of Conduct](https://github.com/PretendoNetwork/Pretendo/blob/master/.github/CODE_OF_CONDUCT.md).');
	}

	if (!payload.pull_request.body?.match(READ_GUIDELINES_REGEX)) {
		issues.push('Failed to find "read guidelines" verification. Please ensure you have read our [contributing guidelines](https://github.com/PretendoNetwork/Pretendo/blob/master/.github/CONTRIBUTING.md).');
	}

	if (!payload.pull_request.body?.match(ISSUE_APPROVED_REGEX)) {
		issues.push('Failed to find "approved issue" verification. Please ensure you are only opening pull requests for changes which have been approved.');
	}

	if (!payload.pull_request.body?.match(TESTED_CHANGES_REGEX)) {
		issues.push('Failed to find "tested changes" verification. Please ensure you have tested all changes prior to opening a pull request.');
	}

	if (badCommits.length !== 0 || issues.length !== 0) {
		const problems = increaseAndGetGitHubUserProblemsCount(payload.pull_request.user.id);
		let comment = '';

		if (issues.length !== 0) {
			comment = 'Thank you for opening this pull request! I have detected the following possible issues with your pull request:\n';
			comment += '\n';

			for (const issue of issues) {
				comment += `- ${issue}\n`;
			}
		}

		if (badCommits.length !== 0) {
			if (issues.length === 0) {
				comment = 'Thank you for opening this pull request! I have detected the following bad commits in your pull request:\n';
			} else {
				comment += '\n';
				comment += 'Additionally, I have detected the following bad commits in your pull request:\n';
			}

			comment += '\n';

			for (const commit of badCommits) {
				comment += `- \`${commit.hash}\` - ${commit.message}\n`;
			}

			comment += '\n';
			comment += 'These commits did not follow the `type: message` message structure\n';
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
			issue_number: payload.pull_request.number,
			body: comment
		});
	}

	response.sendStatus(200);
}