import { commands, ExtensionContext, FileCreateEvent, SnippetString, window, workspace } from "vscode";
import * as fs from "fs-extra";
import { GENERATE_ASSETS_ID } from "./Consts";
import { TaskJson } from "./TaskJson";
import { LaunchJson } from "./LaunchJson";
import path = require("path");

export async function activate(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand(GENERATE_ASSETS_ID, generateAssets));
    context.subscriptions.push(workspace.onDidCreateFiles(handleNewCsharpFile));
}

async function handleNewCsharpFile(e: FileCreateEvent) {
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

async function generateAssets() {
    const slnFiles = await workspace.findFiles("{**/*.sln}", "{**/node_modules/**,**/.git/**,**/bower_components/**}", 100);

    let file: string;

    if (slnFiles.length > 1) {
        let t = await window.showQuickPick(slnFiles.map(f => f.fsPath));
        if (t === undefined) {
            return;
        }
        file = t;
    }
    else {
        file = slnFiles[0].fsPath;
    }

    if (file === undefined) {
        return;
    }

    fs.ensureDirSync(path.join(path.dirname(file), ".vscode"));

    let text = fs.readFileSync(file).toString().split("\n");

    let launchPath = path.join(path.dirname(file), ".vscode", "launch.json");
    let launchJson: LaunchJson = getLaunchJson(launchPath);

    let tasksPath = path.join(path.dirname(file), ".vscode", "tasks.json");
    let tasksJson: TaskJson = getTaskJson(tasksPath);

    text.filter(line => line.indexOf("Project") === 0).forEach(async (line) => {
        const project = line.split("=")[1].trim();
        let projData = project.split(",");

        let projectName = projData[0].trim();
        projectName = projectName.substring(1, projectName.length - 1);
        let projectPath = projData[1].trim();
        projectPath = projectPath.substring(1, projectPath.length - 1);

        let projectDir = path.dirname(projectPath);

        await handleJson(launchJson, tasksJson, projectName, projectDir, projectPath);
    });

    fs.writeFileSync(tasksPath, JSON.stringify(tasksJson, null, 4));
    fs.writeFileSync(launchPath, JSON.stringify(launchJson, null, 4));
}

async function handleJson(launchJson: LaunchJson, tasksJson: TaskJson, projectName: string, projectDir: string, projectPath: string) {
    let launchAlreadyExists = false;
    launchJson.configurations.forEach(config => {
        if (config.name === projectName) {
            launchAlreadyExists = true;
        }
    });

    if (launchAlreadyExists === false) {
        let outputTypeRegex = new RegExp("<OutputType>(.*)</OutputType>");
        let targetFrameworkRegex = new RegExp("<TargetFramework>(.*)<\/TargetFramework>");
        let data = fs.readFileSync(path.join(workspace.workspaceFolders![0].uri.fsPath, projectPath)).toString();
        let outputType = outputTypeRegex.exec(data)![1];
        if (outputType === "Library") {
            return;
        }
        let target = targetFrameworkRegex.exec(data)![1];

        if (target !== undefined) {
            launchJson.configurations.push({
                name: projectName,
                type: "coreclr",
                request: "launch",
                preLaunchTask: "Build " + projectName,
                program: "${workspaceFolder}/" + projectDir + "/bin/Debug/" + target[1] + "/" + projectName + ".dll",
                cwd: "${workspaceFolder}/" + projectDir,
                console: "integratedTerminal"
            });
        } else {
            window.showErrorMessage("Could not find target framework in " + projectPath);
        }
    }

    let taskAlreadyExists = false;
    tasksJson.tasks.forEach(task => {
        if (task.label === "Build " + projectName) {
            taskAlreadyExists = true;
        }
    });

    if (taskAlreadyExists === false) {
        tasksJson.tasks.push({
            label: "Build " + projectName,
            command: "dotnet",
            type: "process",
            args: [
                "build",
                "${workspaceFolder}/" + projectPath,
                "/property:GenerateFullPaths=true",
                "/consoleloggerparameters:NoSummary"
            ],
            problemMatcher: "$msCompile",
            group: "build"
        });
    }
}

function getLaunchJson(launchPath: string): LaunchJson {
    if (fs.existsSync(launchPath)) {
        return JSON.parse(fs.readFileSync(launchPath).toString());
    } else {
        return {
            version: "0.2.0",
            configurations: []
        };
    }
}

function getTaskJson(tasksPath: string): TaskJson {
    if (fs.existsSync(tasksPath)) {
        return JSON.parse(fs.readFileSync(tasksPath).toString());
    } else {
        return {
            version: "2.0.0",
            tasks: []
        };
    }
}

export function deactivate() { }
