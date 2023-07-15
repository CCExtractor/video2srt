import {describe, test, expect, vi } from 'vitest';
import { convert_to_webvtt }  from './WebVTT.svelte';
import {subs, WEB_VTT_OUTPUT} from './test_data';

describe("WebVTT Component", () => {
    test("It should generate a SRT file", () => {
        const result = convert_to_webvtt(subs)
        expect(result).equal(WEB_VTT_OUTPUT);
    })
});