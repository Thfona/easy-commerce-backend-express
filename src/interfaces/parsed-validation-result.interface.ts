import { ValidationResult } from 'joi';

export interface ParsedValidationResult extends ValidationResult {
  parsedErrorMessage: string;
}
