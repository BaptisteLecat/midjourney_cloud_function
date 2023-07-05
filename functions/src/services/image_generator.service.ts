
import { Midjourney } from 'midjourney';
import { Subject } from 'rxjs';
import { GeneratedImage } from '../entities/generated-image.entities';


export class ImageGeneratorService {
    private progressSubject: Subject<string>;

    constructor() {
        this.progressSubject = new Subject<string>();
    }

    async generateImage(prompt: string) {
        const client = new Midjourney({
            ServerId: process.env.DISCORD_SERVER_ID,
            ChannelId: process.env.DISCORD_CHANNEL_ID,
            SalaiToken: process.env.DISCORD_SALAI_TOKEN!,
            Debug: true,
            Ws: true,
        });

        await client.init();
        //await client.Fast();

        // add --aspect 4:7 to the prompt string
        prompt = prompt + " --aspect 4:7";

        const msg = await client.Imagine(prompt, (uri: string, progress: string) => {
            // Émettre l'événement de progression
            this.progressSubject.next(progress);

            console.log("loading", uri, "progress", progress);
        });

        if (!msg || !msg.id || !msg.hash || !msg.content) {
            console.log("no message");
            return;
        }

        const upscaleResult = await client.Upscale({
            index: 1,
            msgId: msg.id,
            hash: msg.hash,
            content: msg.content,
            flags: 0,
            loading: (uri: string, progress: string) => {
                // Émettre l'événement de progression
                this.progressSubject.next(progress);

                console.log("loading", uri, "progress", progress);
            }
        });

        console.log(upscaleResult);

        client.Close();

        return GeneratedImage.fromJSON(upscaleResult);
    }

    // Méthode pour s'abonner aux événements de progression
    onProgress(callback: (progress: string) => void) {
        this.progressSubject.subscribe(callback);
    }

    // Méthode pour se désabonner des événements de progression
    offProgress() {
        this.progressSubject.unsubscribe();
    }
}
