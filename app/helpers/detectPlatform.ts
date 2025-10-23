import { Platform } from "@prisma/client";

// Platform detection based on CSV headers
export const detectPlatform = (headers: string[]): Platform => {
    const hasRewardId = headers.some(header => header === "Reward ID" || header === "Reward Title");
    const hasPerkId = headers.some(header => header === "Perk ID" || header === "Perk");
    
    if (hasRewardId && !hasPerkId) {
        return Platform.KICKSTARTER;
    } else if (hasPerkId && !hasRewardId) {
        return Platform.INDIEGOGO;
    }
    
    // Default to Kickstarter if ambiguous
    return Platform.KICKSTARTER;
}