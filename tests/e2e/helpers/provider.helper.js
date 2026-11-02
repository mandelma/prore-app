import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const deleteTestProvider = async (
    providerId,
    userId
) => {

    const { stdout } = await execFileAsync(
        process.execPath,
        [
            'scripts/e2e-delete-provider.js',
            providerId,
            userId
        ],
        {
            cwd: 'server',
            env: {
                ...process.env,
                NODE_ENV: 'test'
            }
        }
    );

    console.log(stdout);
};