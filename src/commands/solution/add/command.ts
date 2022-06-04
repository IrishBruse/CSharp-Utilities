import { ProcessExecution, Uri, window, workspace } from "vscode";
import { getSolutionFile } from "../../../utility";
import * as fs from "fs-extra";
import path = require("path");
import { exec, execFile, execSync } from "child_process";

export async function addProjectToSolution(uri: Uri) {

    let sln = await getSolutionFile();

    if (!sln) {
        window.showErrorMessage("Error no solution file found");
        return;
    }

    exec("dotnet sln add " + uri.fsPath, { cwd: path.dirname(sln) }, (_, stdout) => {

        if (stdout && !stdout.includes("already contains project")) {
            window.showInformationMessage(stdout);
            return;
        }

        window.showErrorMessage(stdout);
    });


}
