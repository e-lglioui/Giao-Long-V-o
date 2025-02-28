import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string): Types.ObjectId {
    console.log(`Received id: ${value}`); // Log the received id
    const validObjectId = Types.ObjectId.isValid(value);

    if (!validObjectId) {
      throw new BadRequestException('Invalid MongoDB ObjectId');
    }

    return new Types.ObjectId(value);
  }
}