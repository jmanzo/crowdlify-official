// Map CSV headers to data keys (adapted from legacy code)
export const mapKeys = (headers: string[]) => {
    const keys: KeysRecord = { products: [] };
    
    for (const header of headers) {
        if (header === "Reward ID" || header === "Perk ID") {
            keys.rewardId = headers.indexOf(header);
        } else if (header === "Pledged Status" || header === "Fulfillment Status") {
            keys.surveyStatus = headers.indexOf(header);
        } else if (header === "Bonus Support") {
            keys.bonusSupport = headers.indexOf(header);
        } else if (header === "Shipping Country") {
            keys.country = headers.indexOf(header);
        } else if (header === "Reward Title" || header === "Perk") {
            keys.pledgeName = headers.indexOf(header);
        } else if (header === "Backing Minimum" || header === "Amount") {
            keys.price = headers.indexOf(header);
        } else if (header === "Backer Name" || header === "Name") {
            keys.backerName = headers.indexOf(header);
        } else if (header === "Email") {
            keys.backerEmail = headers.indexOf(header);
        } else if (header === "Notes") {
            // Extract product columns after Notes (Kickstarter format)
            headers.forEach((name, key) => {
            if (key > headers.indexOf(header)) {
                // TODO: Remove assertions.
                (keys.products as number[]).push(key);
            }
            });
        } else if (header === "Item Name") {
            // Indiegogo format
            // TODO: Remove assertions.
            (keys.products as number[]).push(headers.indexOf(header));
        }
    }
    
    return keys;
}

// TYPES
type KeysRecord = Record<string, number | number[]>