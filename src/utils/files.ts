import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function getCurrentPathFile(className: string): vscode.Uri {

    let fsPath = null;

    if (vscode.window.activeTextEditor) {
        const currentlyOpenTabfileUri = vscode.window.activeTextEditor.document.uri;
        const currentlyOpenTabfileName = path.basename(currentlyOpenTabfileUri.toString());
        fsPath = currentlyOpenTabfileUri.fsPath.replace(currentlyOpenTabfileName, "");
    }

    if (!fsPath && vscode.workspace.workspaceFolders !== undefined) {
        fsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }

    if (!fsPath) {
        throw new Error('Working folder not found, open a folder an try again');
    }

    return vscode.Uri.parse(`file:` + path.join(`${fsPath}`, `${className}.php`));
}

export async function writeFile(pathFile: vscode.Uri, skeleton: string): Promise<void> {
    await vscode.workspace.fs.writeFile(pathFile, Buffer.from(skeleton));
}

export function showFile(pathFile: vscode.Uri): void {
    vscode.window.showTextDocument(pathFile);
}

function getRootPath(): string|null
{
    if (vscode.workspace.workspaceFolders === undefined) {
        return null;
    }
    return vscode.workspace.workspaceFolders[0].uri.fsPath;

}

function getPsr4(): { [key: string]: string } {
    const rootPath = getRootPath();
    if(!rootPath){
        return {};
    }
    const composerJsonPath = path.join(rootPath, `composer.json`);
    if (!fs.existsSync(composerJsonPath)) {
        return {};
    }
    const composerJsonContent = fs.readFileSync(composerJsonPath, 'utf8');

    const composerJson = JSON.parse(composerJsonContent);

    const autoload = composerJson.autoload;

    if (!autoload || !autoload['psr-4']) {
        return {};
    }

    return autoload['psr-4'];
}

export function generateNamespace(folder: vscode.Uri, fileName: string): string {
    let folderPath = folder.fsPath;
    const psr4 = getPsr4();

    const rootPath = getRootPath();
    folderPath = folderPath.replace(rootPath??'', '');
    folderPath = folderPath.replace(/\/|\\/g, '\\').replace(/\\/, '');

    for (const prefix of Object.keys(psr4)) {
        const basePath = psr4[prefix].replace(/\/|\\/g, '\\\\');
        const prefixRegex = new RegExp(`^${basePath}`);

        if (prefixRegex.test(folderPath)) {
            const relativePath = folderPath.replace(prefixRegex, '');
            const namespace = prefix + relativePath;
            vscode.window.showInformationMessage("in1");
            return namespace;
        }
    }
    vscode.window.showInformationMessage("out");
    return folderPath;
}
