import { window, workspace } from "vscode";

export async function getSolutionFile() {
    const slnFiles = await workspace.findFiles("{**/*.sln}", "{**/node_modules/**,**/.git/**,**/bower_components/**}", 100);

    let file: string | undefined;

    if (slnFiles.length > 1) {
        file = await window.showQuickPick(slnFiles.map(f => f.fsPath));
    }
    else {
        file = slnFiles[0].fsPath;
    }

    return file;
}
