import { GeneratedImage } from "./generated-image.entities";

export class Generation {
  id: string;
  generatedImage: GeneratedImage | null;
  progress: number;
  prompt: string;

  public constructor(id: string, generatedImage: GeneratedImage | null, progress: number = 0, prompt: string) {
    this.id = id;
    this.generatedImage = generatedImage;
    this.progress = progress;
    this.prompt = prompt;
  }

  static fromFirestoreDocument(id: any, data: any): Generation {
    return new Generation(id, data.generatedImage, data.progress, data.prompt);
  }

  static fromJson(data: any): Generation {
    return new Generation(data.id, data.generatedImage, data.progress, data.prompt);
  }

  toFirestoreDocument(): any {
    return {
      id: this.id,
      generatedImage: (this.generatedImage == null) ? null : this.generatedImage.toJSON(),
      progress: this.progress,
      prompt: this.prompt
    };
  }

  toJson(): any {
    return {
      id: this.id,
      generatedImage: (this.generatedImage == null) ? null : this.generatedImage.toJSON(),
      progress: this.progress,
      prompt: this.prompt
    };
  }
}
