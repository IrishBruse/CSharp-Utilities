import * as vscode from "vscode";

export async function getSolutionFile(): Promise<string | undefined>
{
    const slnFiles = await vscode.workspace.findFiles("{**/*.sln}", "**/.git/**}", 100);
    if (slnFiles.length === 0)
    {
        return;
    }

    let sln = slnFiles[0].fsPath;

    if (slnFiles.length > 1)
    {
        const choice = await vscode.window.showQuickPick(slnFiles.map(file => file.fsPath))
        if (!choice)
        {
            return;
        }
        sln = choice;
    }

    if (!sln)
    {
        return;
    }

    return sln;
}
