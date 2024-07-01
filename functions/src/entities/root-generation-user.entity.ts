export class RootGenerationUser {
    id: string;
    firstname: string;
    lastname: string;
    email: string;

    public constructor(
        id: string,
        firstname: string,
        lastname: string,
        email: string,
    ) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
    }

    static fromFirestoreDocument(id: any, data: any): RootGenerationUser {
        return new RootGenerationUser(
            id,
            data.firstname,
            data.lastname,
            data.email,
        );
    }

    static fromJson(data: any): RootGenerationUser {
        return new RootGenerationUser(
            data.id,
            data.firstname,
            data.lastname,
            data.email,
        );
    }

    toFirestoreDocument(): any {
        const firestoreDocument: any = {
            id: this.id,
            firstname: this.firstname,
            lastname: this.lastname,
            email: this.email,
        };
        //Remove all undefined values
        Object.keys(firestoreDocument).forEach(
            (key) =>
                firestoreDocument[key] === undefined && delete firestoreDocument[key],
        );

        return firestoreDocument;
    }

    toJson(): any {
        return {
            id: this.id,
            firstname: this.firstname,
            lastname: this.lastname,
            email: this.email,
        };
    }
}