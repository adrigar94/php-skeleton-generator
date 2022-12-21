import * as vscode from 'vscode';
import * as path from 'path';
import { showFile, writeFile, generateNamespace } from './utils/files';

export async function wizardGeneratePhpSkeleton() {
    const folder = await wizardSelectFolder();
    const type = await wizardFileType();
    const fileName = await wizardFileName(type);

    const namespace = generateNamespace(folder,fileName);

    const classSkeleton = generatePhpSkeleton(type,fileName,namespace);

    const pathFile =  vscode.Uri.parse(`file:` + path.join(`${folder.fsPath}`, `${fileName}.php`));

    await writeFile(pathFile, classSkeleton);
    
    showFile(pathFile);
}

async function wizardSelectFolder(): Promise<vscode.Uri>
{
    if (!vscode.workspace) {
        throw new Error("Working folder not found, open a folder an try again");
    }
    const folder = await vscode.window.showOpenDialog(
        {
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: "Select folder where new class should be placed"
        }
    );

    if (!folder) {
        throw new Error("Select the folder where you want create a PHP file");
    }

    return folder[0];
}

async function wizardFileType(): Promise<string>
{
    const acceptedTypes = [
        "class",
        // "interface",
        // "trait",
        // "enum",
        // "value object (immutable class)"
    ];
    const type = await vscode.window.showQuickPick(
        acceptedTypes,
        {
            placeHolder: "select the type of file you want to create"
        }
    );

    if (!type) {
        throw new Error('It is required to provide a type for the file');
    }
    return type;
}

async function wizardFileName(type: string): Promise<string>
{
    let className = await vscode.window.showInputBox({
        placeHolder: `Name of ${type}`
    });
    if (!className) {
        throw new Error("It is required to provide a name for the class");
    }
    className = capitalizeAndTrim(className);
    return className;
}

function generatePhpSkeleton(type: string,className: string, namespace: string): string
{
    if(type === "class"){
        return generatePhpClassSkeleton(className, namespace);
    }
    return "## TODO";
}

function generatePhpClassSkeleton(className: string, namespace: string): string {
    return `<?php

namespace ${namespace};
	
class ${className}
{
	public function __construct()
	{
	}
}`;

}



function capitalizeAndTrim(str: string): string {
    const words = str.split(' ');
    let result = "";
    for (let word of words) {
        result += word.charAt(0).toUpperCase() + word.slice(1);
    }
    return result;
}