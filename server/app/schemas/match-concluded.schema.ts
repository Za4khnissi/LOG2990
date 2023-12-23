import { MatchConcluded } from '@common/definitions';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MatchConcludedDocument = MatchConcludedEntity & Document;

@Schema()
export class MatchConcludedEntity implements MatchConcluded {
    @Prop({ required: true })
    gameName: string;

    @Prop({ required: true })
    initialPlayerCount: number;

    @Prop({ required: true })
    bestScore: number;

    @Prop({ required: true })
    beginDate: Date;
}

export const MATCH_CONCLUDED_SCHEMA = SchemaFactory.createForClass(MatchConcludedEntity);
