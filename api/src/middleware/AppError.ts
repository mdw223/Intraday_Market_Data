export class AppError extends Error {
    constructor(
        public override readonly message: string,
        public readonly statusCode: number,
    ) {
        super(message);
        this.name = "AppError";
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
