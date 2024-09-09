import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {User} from 'src/models/user.schema';
import {CreateUserDto, UpdateUserDto} from './user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
	constructor(@InjectModel('user') private userModel: Model<User>) {}

	async createUser(data: CreateUserDto): Promise<User> {
		const hashedPassword = await bcrypt.hash(data.password, 10); // Hash de la contraseña
		const newUser = new this.userModel({
			...data,
			password: hashedPassword,
		});
		return newUser.save();
	}

	async findById(id: string): Promise<User | null> {
		return this.userModel.findById(id).populate('role').exec();
	}

	async findAll(): Promise<User[]> {
		return this.userModel.find().populate('role').exec();
	}

	async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
		return this.userModel.findByIdAndUpdate(id, updateUserDto, {new: true}).exec();
	}

	async deleteUser(id: string): Promise<boolean> {
		const result = await this.userModel.findByIdAndDelete(id).exec();
		return result !== null;
	}
}
