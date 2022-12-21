import * as vscode from 'vscode';
import * as path from 'path';

export async function generatePhpSkeleton() {

    let className = await vscode.window.showInputBox({
        placeHolder: 'Name of class'
    });

    if (!className) {
        vscode.window.showInformationMessage("It is required to provide a name for the class");
        return;
    }

    className = capitalizeAndTrim(className);
    const classSkeleton = generatePhpClassSkeleton(className);

    const pathFile = getPathFile(className);
    if (!pathFile) {
        vscode.window.showInformationMessage("Working folder not found, open a folder an try again");
        return;
    }

    await vscode.workspace.fs.writeFile(pathFile, Buffer.from(classSkeleton));
    vscode.window.showTextDocument(pathFile);
}


function generatePhpClassSkeleton(className: string): string {
    return `<?php

## TODO: generate namespace
	
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