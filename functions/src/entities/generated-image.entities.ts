export class GeneratedImage {
    id: string;
    hash: string;
    progress: number;
    uri: string;
    content: string;

    constructor(id: string, hash: string, progress: number, uri: string, content: string) {
        this.id = id;
        this.hash = hash;
        this.progress = progress;
        this.uri = uri;
        this.content = content;
    }

    static fromJSON(json: any): GeneratedImage {
        return new GeneratedImage(json.id, json.hash, json.progress, json.uri, json.content);
    }

    toJSON(): any {
        return {
            id: this.id,
            hash: this.hash,
            progress: this.progress,
            uri: this.uri,
            content: this.content
        };
    }
}