import * as vscode from "vscode";
import { getSolutionFile } from "../../../utility";
import * as path from "path";
import { exec } from "child_process";

export async function addProjectToSolution(uri: vscode.Uri)
{

    let sln = await getSolutionFile();

    if (!sln)
    {
        vscode.window.showErrorMessage("Error no solution file found");
        return;
    }

    exec("dotnet sln add " + uri.fsPath, { cwd: path.dirname(sln) }, (_, stdout) =>
    {

        if (stdout && !stdout.includes("already contains project"))
        {
            vscode.window.showInformationMessage(stdout);
            return;
        }

        vscode.window.showErrorMessage(stdout);
    });
}
