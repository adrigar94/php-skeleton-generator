import * as vscode from 'vscode';
import { getPathFile, showFile, writeFile } from './utils/files';

export async function wizardGeneratePhpSkeleton() {

    const type = await wizardFileType();
    const fileName = await wizardFileName(type);
    const classSkeleton = generatePhpSkeleton(type,fileName);

    const pathFile = getPathFile(fileName);

    await writeFile(pathFile, classSkeleton);
    
    showFile(pathFile);
}

async function wizardFileType(): Promise<string>
{
    const type = await vscode.window.showQuickPick(
        [
            "class",
            // "interface",
            // "trait",
            // "enum",
            // "value object (immutable class)"
        ],
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

function generatePhpSkeleton(type: string,className: string): string
{
    if(type === "class"){
        return generatePhpClassSkeleton(className);
    }
    return "## TODO";
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



function capitalizeAndTrim(str: string): string {
    const words = str.split(' ');
    let result = "";
    for (let word of words) {
        result += word.charAt(0).toUpperCase() + word.slice(1);
    }
    return result;
}