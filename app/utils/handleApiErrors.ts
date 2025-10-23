export const handleApiError = ({ status = 400, errors }: HandleApiErrorParams) => {
    console.log('HandleApiError: ', errors);
    console.log('HandleApiError error typeof', typeof errors);

    let errorsArray: ApiError[] = [];

    if (errors instanceof Error) {
        console.log('HandleApiError type: Error', errors.message);

        errorsArray = [{
            __typename: 'ApiError',
            id: crypto.randomUUID(),
            type: 'error',
            message: errors.message,
        }];
    } else if (typeof errors === "object" && errors !== null && !Array.isArray(errors)) {
        console.log('HandleApiError type: object');

        errorsArray = Object.entries(errors).map(([field, message]) => ({
            __typename: 'ApiError',
            id: crypto.randomUUID(),
            type: 'validation',
            message,
            field  // Add field to identify which form field has the error
        }));
    } else if (errors instanceof Response) {
        console.log('HandleApiError type: Response');

        errors
            .json()
            .then((data) => console.log(data))
            .catch(console.error);

        errorsArray = [{ 
            __typename: 'ApiError', 
            id: crypto.randomUUID(), 
            type: 'error', 
            message: errors.statusText 
        }]; // TODO - Improve this
    } else if (typeof errors === 'string') {
        console.log('HandleApiError type: string');
    
        errorsArray = [
          {
            __typename: 'ApiError',
            id: crypto.randomUUID(),
            type: 'unknown',
            message: `${errors} - This is an uncoded/unhandled ApiError, thrown as: string`,
          },
        ];
    } else {
        console.log('HandleApiError type: unknown');
        //
        errorsArray = [
          {
            __typename: 'ApiError',
            id: crypto.randomUUID(),
            type: 'unknown',
            message: 'Unhandled ApiError',
          },
        ]; // Expand to support if you encounter an unhanded error
    }

    console.log(errorsArray);
    
    return { errors: errorsArray, payload: null, status };
}

// TYPES
export type HandleApiErrorParams = {
    status: number,
    errors: unknown
}

export type ApiError = ApiErrorBase & OtherApiError;

export type ApiErrorBase = {
    __typename: 'ApiError';
    id: string;
    message: string;
    field?: string;
};
  
type OtherApiError = {
    // 👇🏻 you can expand these codes to react however you want in the client
    type: 'graphql' | 'prisma' | 'error' | 'unknown' | "validation";
};