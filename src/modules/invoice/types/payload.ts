import type { CommonFunction } from "../../../common/types/common";

export interface ConvertWordToPdfPayload extends CommonFunction {
    file: File;
}