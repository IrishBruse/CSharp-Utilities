import { commands, ExtensionContext, languages, workspace } from "vscode";
import { generateAssets } from "./commands/generateAssets/command";
import { handleNewFile } from "./features/newFile";

const _ = "irishbruse.csharp-utilities.";

export const GENERATE_ASSETS_ID = _ + "generate-assets";

export async function activate(context: ExtensionContext) {
    // Commands
    context.subscriptions.push(commands.registerCommand(_ + "generate-assets", generateAssets));

    // Features
    context.subscriptions.push(workspace.onDidCreateFiles(handleNewFile));
}

export function deactivate() { }
