declare module "@cloudinary/url-gen" {
    export class Cloudinary {
      constructor(config: { cloud: { cloudName: string } });
      image(publicId: string): any; // Tipo genérico, ajusta según la API
    }
    export * from "@cloudinary/url-gen/qualifiers/gravity";
  }
  
  declare module "@cloudinary/react" {
    export const AdvancedImage: React.FC<{ cldImg: any; alt: string; loading?: "lazy" | "eager" }>;
  }