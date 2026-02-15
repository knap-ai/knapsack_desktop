export type PollInput = {
    question: string;
    options: string[];
    maxSelections?: number;
    durationHours?: number;
};
export type NormalizedPollInput = {
    question: string;
    options: string[];
    maxSelections: number;
    durationHours?: number;
};
type NormalizePollOptions = {
    maxOptions?: number;
};
export declare function normalizePollInput(input: PollInput, options?: NormalizePollOptions): NormalizedPollInput;
export declare function normalizePollDurationHours(value: number | undefined, options: {
    defaultHours: number;
    maxHours: number;
}): number;
export {};
