import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const deleteTestUser = async (userId) => {

    const { stdout } = await execFileAsync(
        process.execPath,
        ["scripts/e2e-delete-user.js", userId],
        {
            cwd: "server",
            env: {
                ...process.env,
                NODE_ENV: "test"
            }
        }
    );

    console.log(stdout);
};