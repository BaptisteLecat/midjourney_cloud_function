import * as functions from "firebase-functions";
import { Generation } from "./entities/generation.entity";
import { ImageGeneratorService } from "./services/image_generator.service";
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

//firestore trigger for when a new generation is created
export const onGenerationCreated = functions.runWith({ timeoutSeconds: 160 }).region("europe-west1").firestore.document('users/{userId}/locations/{locationId}/generations/{generationId}').onCreate(async (snapshot, context) => {
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


//function triggered on user creation
export const onUserCreated = functions.region("europe-west1").auth.user().onCreate(async (user) => {
    //create a new document in firestore
    const userRef = db.collection('users').doc(user.uid);
    await userRef.set({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
});


//Cloud function to allow a user to delete their account
export const deleteAccount = functions.region("europe-west1").https.onCall(async (data, context) => {
    const uid = context.auth?.uid;
    if (uid == null) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to delete your account');
    }

    //delete the user's document in firestore
    const userRef = db.collection('users').doc(uid);
    await userRef.delete();

    //delete the user's account
    await admin.auth().deleteUser(uid);

    return {
        success: true
    };
});