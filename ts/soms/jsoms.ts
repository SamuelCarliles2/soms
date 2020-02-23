export function toJson(jsomsString: string) : string {
    const re : RegExp = new RegExp("\\w*//.*");
    const lines : Array<string> = jsomsString.split("\n");
    return lines
    .filter(line => !re.test(line))
    .join("\n");
}
