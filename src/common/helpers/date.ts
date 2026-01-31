import dayjs from "dayjs";
import { DATE_FORMAT } from '../enums/common';

export function formattedDate(
    date?: string | number | Date | dayjs.Dayjs | null | undefined,
    format?: DATE_FORMAT | string
): string {
    return (
        (date && dayjs(date).format(format ?? DATE_FORMAT.DATE_MINUTE)) || ''
    );
}