/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
    namespace Express {
        interface Request {
            user?: {
                id?: string;
                sub?: string;
                email?: string;
                [key: string]: any;
            };
        }
    }
}

export { };
