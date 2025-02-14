import { strictEqual } from "node:assert"
import { describe, it } from "node:test"
import { isSet } from "./set.js"

describe("isSet()", () => {
    it("true for d9010281825820cdf17a9d7eeb9aa1d5c4ec2a9727305e197f233348e8441932a0ef0fbe539f6b181c", () => {
        strictEqual(
            isSet(
                "d9010281825820cdf17a9d7eeb9aa1d5c4ec2a9727305e197f233348e8441932a0ef0fbe539f6b181c"
            ),
            true
        )
    })

    it("false for 81825820cdf17a9d7eeb9aa1d5c4ec2a9727305e197f233348e8441932a0ef0fbe539f6b181c", () => {
        strictEqual(
            isSet(
                "81825820cdf17a9d7eeb9aa1d5c4ec2a9727305e197f233348e8441932a0ef0fbe539f6b181c"
            ),
            false
        )
    })
})
