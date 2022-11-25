import * as vscode from "vscode";
import { generateAssets } from "./commands/generateAssets/command";
import { addProjectToSolution } from "./commands/solution/add/command";
import { handleNewFile } from "./features/newFile";
import { CSprojEditorProvider } from "./panels/csprojView";

export const ns = "csharp-utilities";

export async function activate(context: vscode.ExtensionContext)
{
    // Commands
    context.subscriptions.push(vscode.commands.registerCommand(ns + ".generate-assets", generateAssets));
    context.subscriptions.push(vscode.commands.registerCommand(ns + ".solution.add", addProjectToSolution));

    let autoGenerateAssets = vscode.workspace.getConfiguration(ns).get<Boolean>("autoGenerateAssets");

    if (autoGenerateAssets)
    {
        generateAssets();
    }

    // Features
    context.subscriptions.push(vscode.workspace.onDidCreateFiles(handleNewFile));

    // Editor
    context.subscriptions.push(CSprojEditorProvider.register(context));
}


export function deactivate() { }
