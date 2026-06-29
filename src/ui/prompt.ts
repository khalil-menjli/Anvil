import { confirm } from "@inquirer/prompts";

export async function askApproval(message:string):Promise<boolean> {
    return await confirm({ message})
}