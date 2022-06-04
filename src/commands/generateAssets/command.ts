import { window, workspace } from "vscode";
import * as fs from "fs-extra";
import { TaskJson } from "./TaskJson";
import { LaunchJson } from "./LaunchJson";
import path = require("path");
import { getSolutionFile } from "../../utility";

export async function generateAssets() {
    let sln = await getSolutionFile();

    if (!sln) {
        window.showErrorMessage("Error no solution file found");
        return;
    }

    fs.ensureDirSync(path.join(path.dirname(sln), ".vscode"));

    let lines = fs.readFileSync(sln).toString().split("\n");

    let launchPath = path.join(path.dirname(sln), ".vscode", "launch.json");
    let launchJson: LaunchJson = getLaunchJson(launchPath);

    let tasksPath = path.join(path.dirname(sln), ".vscode", "tasks.json");
    let tasksJson: TaskJson = getTaskJson(tasksPath);

    let projects = lines.filter(line => line.indexOf("Project") === 0);

    for (const line of projects) {
        const project = line.split("=")[1].trim();
        let projData = project.split(",");

        let projectName = projData[0].trim();
        projectName = projectName.substring(1, projectName.length - 1);
        let projectPath = projData[1].trim();
        projectPath = projectPath.substring(1, projectPath.length - 1);

        let projectDir = path.dirname(projectPath);

        await generateLaunch(launchJson, projectName, projectDir, projectPath);
        await generateTask(tasksJson, projectName, projectPath);
    }

    fs.writeFileSync(tasksPath, JSON.stringify(tasksJson, null, 4));
    fs.writeFileSync(launchPath, JSON.stringify(launchJson, null, 4));
}

export async function generateLaunch(launchJson: LaunchJson, projectName: string, projectDir: string, projectPath: string) {
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
        let outputTypes = outputTypeRegex.exec(data);

        if (outputTypes === null || outputTypes[1] === null) {
            return;
        }

        // Cant launch debug run a Library project
        if (outputTypes[1] === "Library") {
            return;
        }

        let target = targetFrameworkRegex.exec(data);

        if (target === null) {
            window.showErrorMessage("Could not find target framework in " + projectPath);
            return;
        }

        launchJson.configurations.push({
            name: projectName,
            type: "coreclr",
            request: "launch",
            preLaunchTask: "Build " + projectName,
            program: "${workspaceFolder}/" + projectDir + "/bin/Debug/" + target[1] + "/" + projectName + ".dll",
            cwd: "${workspaceFolder}/" + projectDir,
            console: "integratedTerminal"
        });
    }
}

export async function generateTask(tasksJson: TaskJson, projectName: string, projectPath: string) {

    let taskAlreadyExists = false;

    for (const task of tasksJson.tasks) {
        if (task.label === "Build " + projectName) {
            taskAlreadyExists = true;
        }
    }

    if (taskAlreadyExists) {
        return;
    }

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

export function getLaunchJson(launchPath: string): LaunchJson {
    if (fs.existsSync(launchPath)) {
        return JSON.parse(fs.readFileSync(launchPath).toString());
    } else {
        return {
            version: "0.2.0",
            configurations: []
        };
    }
}

export function getTaskJson(tasksPath: string): TaskJson {
    if (fs.existsSync(tasksPath)) {
        return JSON.parse(fs.readFileSync(tasksPath).toString());
    } else {
        return {
            version: "2.0.0",
            tasks: []
        };
    }
}
