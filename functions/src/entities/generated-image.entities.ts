export class GeneratedImage {
    id: string;
    hash: string;
    uri: string;

    constructor(id: string, hash: string, uri: string) {
        this.id = id;
        this.hash = hash;
        this.uri = uri;
    }

    static fromJSON(json: any): GeneratedImage {
        return new GeneratedImage(json.id, json.hash, json.uri);
    }

    toJSON(): any {
        return {
            id: this.id,
            hash: this.hash,
            uri: this.uri,
        };
    }
}