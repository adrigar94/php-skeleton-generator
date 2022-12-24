import * as vscode from 'vscode';
import * as path from 'path';
import { showFile, writeFile, generateNamespace } from './utils/files';
import { capitalize, capitalizeAndTrim } from './utils/string';

export async function wizardGeneratePhpSkeleton() {
    const folder = await wizardSelectFolder();
    const type = await wizardFileType();
    const fileName = await wizardFileName(type);

    const namespace = generateNamespace(folder, fileName);

    const classSkeleton = await generatePhpSkeleton(type, fileName, namespace);

    const pathFile = vscode.Uri.parse(`file:` + path.join(`${folder.fsPath}`, `${fileName}.php`));

    await writeFile(pathFile, classSkeleton);

    showFile(pathFile);
}

async function wizardSelectFolder(): Promise<vscode.Uri> {
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

async function wizardFileType(): Promise<string> {
    const acceptedTypes = [
        "class",
        "interface",
        // "trait",
        // "enum"
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

async function wizardFileName(type: string): Promise<string> {
    let fileName = await vscode.window.showInputBox({
        placeHolder: `Name of ${type}`
    });
    if (!fileName) {
        throw new Error("It is required to provide a name for the ${type}");
    }
    fileName = capitalizeAndTrim(fileName);
    return fileName;
}

async function generatePhpSkeleton(type: string, fileName: string, namespace: string): Promise<string> {
    if (type === "class") {
        return await generatePhpClassSkeleton(fileName, namespace);
    }
    if (type === "interface") {
        return await generatePhpInterfaceSkeleton(fileName, namespace);
    }
    return "## TODO";
}

async function generatePhpClassSkeleton(className: string, namespace: string): Promise<string> {
    const properties = await wizardClassProperties();

    let declareProperties = [];
    for (const property of properties) {
        declareProperties.push(`${property.visibility} ${property.type} $${property.name}`);
    }

    let gettersAndSetters = "";
    let equalsCondition = [];
    for (const property of properties) {
        const capitalizedName = capitalize(property.name);
        gettersAndSetters += `
    public function get${capitalizedName}(): ${property.type}
    {
        return $this->${property.name};
    }
    public function set${capitalizedName}($${property.name}): void
    {
        $this->${property.name} = $${property.name};
    }`;
        equalsCondition.push(`$this->get${capitalizedName}() == $toCompare->get${capitalizedName}()`);
    }


    const equalsMethod = equalsCondition.length ? `
    public function equals(self $toCompare): boolean
    {
        return ${equalsCondition.join('\n        AND ')};
    }
    ` : '';

    const skeleton = `<?php

declare(strict_types=1);

namespace ${namespace};

class ${className}
{
    public function __construct(${declareProperties.join(", ")})
    {
    }

${gettersAndSetters}

${equalsMethod}
}`;

    return skeleton;
}

async function wizardClassProperties(): Promise<Array<{ name: string, visibility: string, type: string }>> {
    let properties = [];

    let input = await vscode.window.showInputBox({
        prompt: "Enter a property name (press 'Cancel' or leave empty to finish)"
    });

    while (input) {
        const acceptedVisibilities = [
            "private",
            "protected",
            "public"
        ];
        let visibility = await vscode.window.showQuickPick(
            acceptedVisibilities,
            {
                placeHolder: `Select the visibility of the "${input}" property`
            }
        );
        if (!visibility) {
            visibility = "private";
        }

        let type = await vscode.window.showInputBox({
            prompt: `Enter the type of the "${input}" property (int, string, etc.)`
        });
        if (!type) {
            type = "string";
        }

        properties.push({ name: input, visibility: visibility || '', type: type || '' });

        input = await vscode.window.showInputBox({
            prompt: "Enter another property name (press 'Cancel' or leave empty to finish)"
        });
    }

    return properties;
}

async function generatePhpInterfaceSkeleton(interfaceName: string, namespace: string): Promise<string> {

    const methods = await wizardInterfaceMethods();

    let declareMethods = [];
    for (const method of methods) {
        let paramsMethod: Array<string> = [];
        for (const param of method.params) {
            paramsMethod.push(`${param.type} $${param.name}`);
        }
        declareMethods.push(`    public function ${method.name}(${paramsMethod.join(', ')}): ${method.returnType};`);
    }

    const skeleton =
        `<?php

declare(strict_types=1);

namespace ${namespace};

interface ${interfaceName}
{
${declareMethods.join("\n\n")}
}
`;

    return skeleton;
}

async function wizardInterfaceMethods(): Promise<Array<{ name: string, returnType: string, params: Array<{ type: string, name: string }> }>> {
    let methods = [];

    let methodName = await vscode.window.showInputBox({
        prompt: "Enter a method name (press 'Cancel' or leave empty to finish)"
    });

    while (methodName) {
        let params: Array<{ type: string, name: string }> = [];

        const returnType = await vscode.window.showInputBox({
            prompt: `Enter a return type of "${methodName}" method (default is void)`
        });

        let paramName = await vscode.window.showInputBox({
            prompt: `Enter a parameter name of "${methodName}" method (press 'Cancel' or leave empty to finish)`
        });

        while (paramName) {
            const paramType = await vscode.window.showInputBox({
                prompt: `Enter a type of "${paramName}" parameter (int, string, etc.)`
            });
            params.push({ type: paramType || '', name: paramName });
            paramName = await vscode.window.showInputBox({
                prompt: `Enter another parameter name of "${methodName}" method (press 'Cancel' or leave empty to finish)`
            });
        }

        methods.push({ name: methodName, returnType: returnType || 'void', params: params });

        methodName = await vscode.window.showInputBox({
            prompt: "Enter another method name (press 'Cancel' or leave empty to finish)"
        });
    }

    return methods;
}