// src/test/RankingHolder_spec.ts
import "mocha";
import { expect } from "chai";
import { RankingHolder } from "../RankingHolder";

describe("RankingHolder", () => {
  describe("average", () => {
    let instance: RankingHolder;

    beforeEach(() => {
      instance = new RankingHolder();
    });

    context('when having no result', () => {
      it("should return null", () => {
        expect(instance.average).to.be.null;
      });
    });

    context('when having multiple results', () => {
      it("should return 50 if a result with score 50 is added", () => {
        instance.add({ name: "Yuto", score: 50 });
        expect(instance.average).to.equal(50);
      });

      it("should return 55 when adding 40, 50, 60 and 70", () => {
        instance.add({ name: "Yuto", score: 40 });
        instance.add({ name: "Yuto2", score: 50 });
        instance.add({ name: "Yuto3", score: 60 });
        instance.add({ name: "Yuto4", score: 70 });
        expect(instance.average).to.equal(55);
      });

      it("should return -2 when adding -6, and 2", () => {
        instance.add({ name: "Yuto", score: -6 });
        instance.add({ name: "Yuto2", score: 2 });
        expect(instance.average).to.equal(-2);
      });
    });
  });

  describe("highestScore", () => {
    it("should return null if no result is added", () => {
      const instance = new RankingHolder();
      expect(instance.highestScore).to.be.null;
    });

    it("should return 50 if a result with score 50 is added", () => {
      const instance = new RankingHolder();
      instance.add({ name: "Yuto", score: 50 });
      expect(instance.highestScore).to.equal(50);
    });

    it("should return 70 when adding 40, 50, 60 and 70", () => {
      const instance = new RankingHolder();
      instance.add({ name: "Yuto", score: 40 });
      instance.add({ name: "Yuto2", score: 50 });
      instance.add({ name: "Yuto3", score: 60 });
      instance.add({ name: "Yuto4", score: 70 });
      expect(instance.highestScore).to.equal(70);
    });
  });
});
