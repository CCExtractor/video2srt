import {describe, test, expect, vi } from 'vitest';
import { convert_to_srt }  from './SRT.svelte';
import {SRT_OUTPUT, subs} from './test_data';

describe("SRT Component", () => {
    test("It should generate a SRT file", () => {
        const result = convert_to_srt(subs)
        expect(result).equal(SRT_OUTPUT);
    })
});