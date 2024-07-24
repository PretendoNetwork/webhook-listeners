import path from 'node:path';
import fs from 'fs-extra';
import Database from 'better-sqlite3';

fs.ensureDirSync((path.resolve(process.cwd(), 'data')));

const database = new Database(path.resolve(process.cwd(), 'data', 'database.sqlite'));

database.exec(`CREATE TABLE IF NOT EXISTS github_problems (
	user_id INTEGER PRIMARY KEY,
	problems INTEGER DEFAULT 0
)`);

export function increaseAndGetGitHubUserProblemsCount(userID: number): number {
	return database.prepare<unknown[], { problems: number; }>(`
		INSERT INTO github_problems (user_id, problems)
		VALUES (?, 1)
		ON CONFLICT(user_id) DO UPDATE SET
			problems = github_problems.problems + 1
		RETURNING problems
	`).get(userID)!.problems;
}

export default database;