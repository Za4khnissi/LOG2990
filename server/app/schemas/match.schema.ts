import { Match, MatchStatus } from '@app/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MatchDocument = MatchEntity & Document;

@Schema()
export class MatchEntity implements Match {
    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ required: true })
    gameId: string;

    @Prop([String])
    players: string[];

    @Prop([String])
    blackList: string[];

    @Prop({ required: true })
    currentQuestionIndex: number;

    @Prop({ required: true, default: Date.now })
    beginDate: Date;

    @Prop({ required: true, enum: MatchStatus, default: MatchStatus.WAITING })
    status: MatchStatus;
}

export const MatchSchema = SchemaFactory.createForClass(MatchEntity);
