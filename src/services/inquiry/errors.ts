
export class InquiryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InquiryValidationError';
  }
}
