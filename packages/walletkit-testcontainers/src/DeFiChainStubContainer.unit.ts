import {DeFiChainStubContainer} from "./DeFiChainStubContainer";
import {waitForExpect} from "@birthdayresearch/sticky-jest";

describe("testcontainers initialize", ()=>{
  it("should initialize containers", async () =>{
    const container = new DeFiChainStubContainer()
    expect(container instanceof DeFiChainStubContainer).toBe(true)
  })
})
