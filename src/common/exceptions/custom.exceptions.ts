import { HttpException, HttpStatus } from '@nestjs/common';

export class SchoolNotFoundException extends HttpException {
  constructor(id: string) {
    super(`School with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class DuplicateSchoolException extends HttpException {
  constructor(name: string) {
    super(`School with name ${name} already exists`, HttpStatus.CONFLICT);
  }
}

export class InvalidOperationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
} 