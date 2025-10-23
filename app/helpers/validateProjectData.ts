import { ProjectStatus } from "@prisma/client";
import { ProjectPayload } from "app/types/predicates/isProjectPayload";

const projectStatus = Object.entries(ProjectStatus).values;

// TODO: This is an usual good scenario where it would be ok using ZOD.
export const validateProjectData = async (data: ProjectPayload) => {
    const errors: Record<string, string> = {};
  
    if (!data.name && data.name === "") {
      errors.name = "Name is required";
    }
  
    if (data.image && data.image !== "") {
        try {
            new URL(data.image);
            // Check for image file extension (basic check)
            const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
            const hasImageExtension = imageExtensions.some(ext => data.image!.toLowerCase().includes(ext));
            if (!hasImageExtension) {
                errors.image = "URL must point to an image file (jpg, png, gif, etc)";
            }
        } catch {
            errors.image = "Must be a valid URL";
        }
    }

    if (!data.status && !(data.status in projectStatus)) {
        errors.status = `Status must be ${ProjectStatus.ACTIVE} or ${ProjectStatus.DRAFT}.`
    }
  
    if (Object.keys(errors).length) {
      return errors;
    }
}