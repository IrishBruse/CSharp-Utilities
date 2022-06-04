import { commands, ExtensionContext, languages, workspace } from "vscode";
import { generateAssets } from "./commands/generateAssets/command";
import { addProjectToSolution } from "./commands/solution/add/command";
import { handleNewFile } from "./features/newFile";

const _ = "csharp-utilities.";

export async function activate(context: ExtensionContext) {
    // Commands
    context.subscriptions.push(commands.registerCommand(_ + "generate-assets", generateAssets));
    context.subscriptions.push(commands.registerCommand(_ + "solution.add", addProjectToSolution));

    // Features
    context.subscriptions.push(workspace.onDidCreateFiles(handleNewFile));
}

export function deactivate() { }
