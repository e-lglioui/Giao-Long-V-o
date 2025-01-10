import { Document } from 'mongoose';
export interface Course extends Document {
  schoolId: string;
  instructorId: string;
  title: string;
  description?: string;
  schedule?: Array<{
    date: Date;
    startTime: string;
    endTime: string;
  }>;
  capacity?: number;
  participants?: string[];
  createdAt: Date;
  updatedAt: Date;
} 