// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "php-class-generator" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('php-class-generator.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from PHP Class Generator!');
    });
    context.subscriptions.push(disposable);

    context.subscriptions.push(vscode.commands.registerCommand('php-class-generator.generate-php-class', generateFilePhpClass));
}

// This method is called when your extension is deactivated
export function deactivate() { }


async function generateFilePhpClass() {

    let className = await vscode.window.showInputBox({
        placeHolder: 'Name of class'
    });

    if (!className) {
        vscode.window.showInformationMessage("It is required to provide a name for the class");
        return;
    }

    className = capitalizeAndTrim(className);
    const classSkeleton = generateSkeleton(className);

    const pathFile = getPathFile(className);
    if (!pathFile) {
        vscode.window.showInformationMessage("Working folder not found, open a folder an try again");
        return;
    }

    // const rootPath = vscode.workspace.rootPath;
    // let pathFile = vscode.Uri.parse(`file:` + path.join(`${rootPath}`, `${className}.php`));

    await vscode.workspace.fs.writeFile(pathFile, Buffer.from(classSkeleton));
    vscode.window.showTextDocument(pathFile);
}


function generateSkeleton(className: string): string {
    return `<?php
	
class ${className}
{
	public function __construct()
	{
	}
}`;

}

function getPathFile(className: string): vscode.Uri | null {

    let fsPath = null;

    // Create in current file directory
    if (vscode.window.activeTextEditor) {
        const currentlyOpenTabfileUri = vscode.window.activeTextEditor.document.uri;
        const currentlyOpenTabfileName = path.basename(currentlyOpenTabfileUri.toString());
        fsPath = currentlyOpenTabfileUri.fsPath.replace(currentlyOpenTabfileName, "");
    }

    // Create in root workspace
    if (!fsPath && vscode.workspace.workspaceFolders !== undefined) {
        fsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }

    if (fsPath) {
        return vscode.Uri.parse(`file:` + path.join(`${fsPath}`, `${className}.php`));
    }

    return null;
}

function capitalizeAndTrim(str: string): string {
    const words = str.split(' ');
    let result = "";
    for (let word of words) {
        result += word.charAt(0).toUpperCase() + word.slice(1);
    }
    return result;
}