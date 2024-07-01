export class Location {
    id: string;
    city: string;
    latitude: number;
    longitude: number;

    public constructor(id: string, city: string, latitude: number, longitude: number) {
        this.id = id;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    static fromFirestoreDocument(id: any, data: any): Location {
        return new Location(id, data.city, data.latitude, data.longitude);
    }

    static fromJson(data: any): Location {
        return new Location(data.id, data.city, data.latitude, data.longitude);
    }

    toFirestoreDocument(): any {
        return {
            id: this.id,
            city: this.city,
            latitude: this.latitude,
            longitude: this.longitude,
        };
    }

    toJson(): any {
        return {
            id: this.id,
            city: this.city,
            latitude: this.latitude,
            longitude: this.longitude,
        };
    }
}
