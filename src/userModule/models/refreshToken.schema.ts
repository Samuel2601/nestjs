// src/userModule/models/refreshToken.schema.ts
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

@Schema({timestamps: true})
export class RefreshToken extends Document {
	@Prop({required: true})
	userId: string;

	@Prop({required: true, unique: true})
	token: string;

	@Prop({required: true})
	expiresAt: Date;

	@Prop()
    lastUsedAt: Date;
    
	@Prop({required: true})
	ipAddress: string;

	@Prop({default: false})
	isRevoked: boolean;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
