import * as vscode from "vscode";
import * as fs from "fs-extra";
import { DEBUG_COMMAND_ID } from "./Consts";
import { TaskJson } from "./TaskJson";
import { LaunchJson } from "./LaunchJson";
import path = require("path");

export async function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(DEBUG_COMMAND_ID, debug));
}

async function debug() {
    const slnFiles = await vscode.workspace.findFiles("{**/*.sln}", "{**/node_modules/**,**/.git/**,**/bower_components/**}", 100);

    let file;

    if (slnFiles.length > 1) {
        file = await vscode.window.showQuickPick(slnFiles.map(f => f.fsPath));
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

    text.filter(line => line.indexOf("Project") === 0).forEach(line => {
        const project = line.split("=")[1].trim();
        let projData = project.split(",");

        let projectName = projData[0].trim();
        projectName = projectName.substring(1, projectName.length - 1);
        let projectPath = projData[1].trim();
        projectPath = projectPath.substring(1, projectPath.length - 1);

        let projectDir = path.dirname(projectPath);

        handleJson(launchJson, tasksJson, projectName, projectDir, projectPath);
    });


    fs.writeFileSync(tasksPath, JSON.stringify(tasksJson, null, 4));
    fs.writeFileSync(launchPath, JSON.stringify(launchJson, null, 4));
}

function handleJson(launchJson: LaunchJson, tasksJson: TaskJson, projectName: string, projectDir: string, projectPath: string) {

    let launchAlreadyExists = false;
    launchJson.configurations.forEach(config => {
        if (config.name === projectName) {
            launchAlreadyExists = true;
        }
    });
    if (launchAlreadyExists === false) {
        let targetFrameworkRegex = new RegExp("<TargetFramework>(.*)<\/TargetFramework>");
        let data = fs.readFileSync(projectPath).toString();
        let target = targetFrameworkRegex.exec(data);

        if (target !== null) {
            console.log(target[0]);

            launchJson.configurations.push({
                name: projectName,
                type: "coreclr",
                request: "launch",
                preLaunchTask: "Build " + projectName,
                program: "${workspaceFolder}" + projectDir + "/bin/Debug/" + target + "/" + projectName + ".dll",
                cwd: "${workspaceFolder}/" + projectDir,
                console: "integratedTerminal"
            });
        } else {
            vscode.window.showErrorMessage("Could not find target framework in " + projectPath);
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
