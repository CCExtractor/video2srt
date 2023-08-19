/**
 * Generate the seconds of a subtitle block
 * @param last_line The subtitle block with the text
 * @returns The seconds of the last subtitle blocks
 */
export const getFinishedSeconds = function (last_line: string) : number {
    const pattern = /\d{2}:\d{2}:\d{2}\.\d{3}/g; // Regular expression to match timestamps

    const timestamps = last_line.match(pattern); // Find all timestamps in the range
    const endTimestamp: string = timestamps[1];

    const endTimestampParts = endTimestamp.split(/[:.]/);
    const endTimestampSeconds: number =
    parseInt(endTimestampParts[0]) * 3600 +
    parseInt(endTimestampParts[1]) * 60 +
    parseInt(endTimestampParts[2]) +
    parseInt(endTimestampParts[3]) / 1000;

    return endTimestampSeconds;

}