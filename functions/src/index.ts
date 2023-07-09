import * as functions from "firebase-functions";
import { Generation } from "./entities/generation.entity";
import { ImageGeneratorService } from "./services/image_generator.service";

//firestore trigger for when a new generation is created
export const onGenerationCreated = functions.runWith({ timeoutSeconds: 100 }).region("europe-west1").firestore.document('users/{userId}/locations/{locationId}/generations/{generationId}').onCreate(async (snapshot, context) => {
    const generationId = context.params.generationId;
    const generation = Generation.fromFirestoreDocument(generationId, snapshot.data());
    let imageGeneratorService: ImageGeneratorService = new ImageGeneratorService();

    //Register progress callback
    imageGeneratorService.onProgress(async (progress: string) => {
        //Save progress to firestore
        progress = progress.replace('%', '');
        generation.progress = parseInt(progress);
        console.log(generation.toFirestoreDocument());
        await snapshot.ref.set(generation.toFirestoreDocument());
    });

    //Generate image
    await imageGeneratorService.generateImage(generation.prompt).then(async (generatedImage) => {
        if (generatedImage == null || generatedImage == undefined) {
            console.log("generatedImage is null or undefined");
            throw new Error("Unable to generate image");
        }

        //Save image to firestore
        generation.generatedImage = generatedImage;
        generation.progress = 100;
        console.log(generation.toFirestoreDocument());
        await snapshot.ref.set(generation.toFirestoreDocument());

    });
    imageGeneratorService.offProgress();
});