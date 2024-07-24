import * as functions from "firebase-functions";
import { Generation } from "./entities/generation.entity";
import { ImageGeneratorService } from "./services/image_generator.service";
import * as admin from 'firebase-admin';
import {RootGeneration} from "./entities/root-generation.entity";
import {Location} from "./entities/location.entity";
import {RootGenerationUser} from "./entities/root-generation-user.entity";

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

        //Upload iri image to firebase storage
        const bucket = admin.storage().bucket();
        // generatedImage.uri is like : https://cdn.discordapp.com/attachments/1119307426445938769/1264130641780281394/baptistelecat_The_city_of_Nantes_in_Pays_de_la_Loire_France_is__d5c5c517-f195-4840-b75e-73d7b0fd0ef2.png?ex=669cc0e7&is=669b6f67&hm=6467577159b61033b9800559b513cacef9bf5ce59c36d1dae75814f79e25fd16&
        const file = bucket.file(`generations/${generationId}.png`);
        await file.save(generatedImage.uri, {
            metadata: {
                contentType: 'image/png',
            },
        });

        //Get the public url of the image
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
        });

        generatedImage.uri = url;

        //Save image to firestore
        generation.generatedImage = generatedImage;
        generation.progress = 100;
        console.log(generation.toFirestoreDocument());
        await snapshot.ref.set(generation.toFirestoreDocument());

    });
    imageGeneratorService.offProgress();

    const userRef = db.collection('users').doc(context.params.userId);
    const user = await userRef.get();

    const locationRef = db.collection('users').doc(context.params.userId).collection('locations').doc(context.params.locationId);
    const location = await locationRef.get();

    //Create a generation document in root generations collection for easy access
    const generationRef = db.collection('generations').doc(generationId);
    console.log("Saving generation to root generations collection")
    console.log(new RootGeneration(generationId, generation, Location.fromFirestoreDocument(location.id, location.data()), RootGenerationUser.fromFirestoreDocument(user.id, user.data())).toFirestoreDocument());
    await generationRef.set(new RootGeneration(generationId, generation, Location.fromFirestoreDocument(location.id, location.data()), RootGenerationUser.fromFirestoreDocument(user.id, user.data())).toFirestoreDocument());

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