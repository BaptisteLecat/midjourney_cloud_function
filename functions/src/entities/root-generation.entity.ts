import {Generation} from "./generation.entity";
import {Location} from "./location.entity";
import {RootGenerationUser} from "./root-generation-user.entity";

export class RootGeneration {
    id: string;
    generation: Generation;
    location: Location;
    user: RootGenerationUser;

    public constructor(id: string, generation: Generation, location: Location, user: RootGenerationUser) {
        this.id = id;
        this.generation = generation;
        this.location = location;
        this.user = user;
    }

    static fromFirestoreDocument(id: any, data: any): RootGeneration {
        return new RootGeneration(id, data.generation, data.location, data.user);
    }

    static fromJson(data: any): RootGeneration {
        return new RootGeneration(data.id, data.generation, data.location, data.user);
    }

    toFirestoreDocument(): any {
        return {
            id: this.id,
            generation: (this.generation == null) ? null : this.generation.toFirestoreDocument(),
            location: (this.location == null) ? null : this.location.toFirestoreDocument(),
            user: (this.user == null) ? null : this.user.toFirestoreDocument(),
        };
    }

    toJson(): any {
        return {
            id: this.id,
            generatedImage: (this.generation == null) ? null : this.generation.toJSON(),
            location: (this.location == null) ? null : this.location.toJson(),
            user: (this.user == null) ? null : this.user.toJson(),
        };
    }
}
