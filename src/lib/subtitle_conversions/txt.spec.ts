import {describe, test, expect, vi } from 'vitest';
import { convert_to_txt }  from './TXT.svelte';
import {subs, TXT_OUTPUT} from './test_data';

describe("WebVTT Component", () => {
    test("It should generate a TXT file", () => {
        const result = convert_to_txt(subs)
        expect(result).equal(TXT_OUTPUT);
    })
});