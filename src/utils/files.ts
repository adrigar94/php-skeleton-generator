import * as vscode from 'vscode';
import * as path from 'path';

export function getPathFile(className: string): vscode.Uri
{

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

    if (!fsPath) {
        throw new Error('Working folder not found, open a folder an try again');
    }
    
    return vscode.Uri.parse(`file:` + path.join(`${fsPath}`, `${className}.php`));
}

export async function writeFile(pathFile:  vscode.Uri, skeleton: string): Promise<void>
{
    await vscode.workspace.fs.writeFile(pathFile, Buffer.from(skeleton));
}

export function showFile(pathFile:  vscode.Uri): void
{
    vscode.window.showTextDocument(pathFile);
}