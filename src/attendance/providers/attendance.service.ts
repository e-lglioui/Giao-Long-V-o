import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance } from '../schemas/attendance.schema';
import { CreateAttendanceDto } from '../dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private readonly attendanceModel: Model<Attendance>
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const createdAttendance = new this.attendanceModel(createAttendanceDto);
    return createdAttendance.save();
  }

  async findAll(): Promise<Attendance[]> {
    return this.attendanceModel.find()
      .populate('courseId', 'name')
      .populate('studentId', 'username email')
      .exec();
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceModel.findById(id)
      .populate('courseId', 'name')
      .populate('studentId', 'username email')
      .exec();

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  async findByStudent(studentId: string): Promise<Attendance[]> {
    return this.attendanceModel.find({ studentId })
      .populate('courseId', 'name')
      .populate('studentId', 'username email')
      .exec();
  }

  async findByCourse(courseId: string): Promise<Attendance[]> {
    return this.attendanceModel.find({ courseId })
      .populate('courseId', 'name')
      .populate('studentId', 'username email')
      .exec();
  }

  async update(id: string, updateAttendanceDto: Partial<CreateAttendanceDto>): Promise<Attendance> {
    const attendance = await this.attendanceModel
      .findByIdAndUpdate(id, updateAttendanceDto, { new: true })
      .exec();

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  async remove(id: string): Promise<void> {
    const result = await this.attendanceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }
  }

  async getAttendanceStats(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const attendanceData = await this.attendanceModel.find({
      schoolId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).exec();

    const totalSessions = await this.attendanceModel.countDocuments({
      schoolId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    const presentCount = attendanceData.filter(a => a.status === 'present').length;
    const absentCount = attendanceData.filter(a => a.status === 'absent').length;
    const lateCount = attendanceData.filter(a => a.status === 'late').length;
    const excusedCount = attendanceData.filter(a => a.status === 'excused').length;

    const averageAttendance = totalSessions > 0 ? 
      presentCount / totalSessions : 0;

    const mostAttendedCourses = await this.getMostAttendedCourses(
      schoolId,
      startDate,
      endDate
    );

    return {
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      averageAttendance,
      absenceRate: totalSessions > 0 ? 
        (absentCount / totalSessions) * 100 : 0,
      mostAttendedCourses,
      attendanceTrends: await this.getAttendanceTrends(
        schoolId,
        startDate,
        endDate
      )
    };
  }

  private async getMostAttendedCourses(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    return this.attendanceModel.aggregate([
      {
        $match: {
          schoolId,
          date: {
            $gte: startDate,
            $lte: endDate
          },
          status: 'present'
        }
      },
      {
        $group: {
          _id: '$courseId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $project: {
          courseName: '$course.name',
          attendanceCount: '$count'
        }
      }
    ]);
  }

  private async getAttendanceTrends(
    schoolId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    return this.attendanceModel.aggregate([
      {
        $match: {
          schoolId,
          date: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id',
          attendanceRate: {
            $multiply: [
              { $divide: ['$present', '$total'] },
              100
            ]
          }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);
  }
} 