export class DriveIOError extends Error {
    constructor(public message: string, public result: any) {
        super(message);
    }
}