import { FileCreateEvent, SnippetString, window, workspace } from "vscode";

export async function handleNewFile(e: FileCreateEvent) {
    for (const file of e.files) {
        if (!file.fsPath.endsWith(".cs")) {
            continue;
        }

        const textDocument = await workspace.openTextDocument(file);
        if (textDocument.getText()) {
            continue;
        }

        const snippetLines: string[] = [];
        snippetLines.push("namespace $WORKSPACE_NAME;");
        snippetLines.push("");
        snippetLines.push("public ${1|class ,struct ,interface ,enum ,abstract class ,interface I|}${TM_FILENAME_BASE}");
        snippetLines.push("{");
        snippetLines.push("\t$0");
        snippetLines.push("}");
        snippetLines.push("");

        const textEditor = await window.showTextDocument(file);
        textEditor.insertSnippet(new SnippetString(snippetLines.join("\n")));
    }
}
