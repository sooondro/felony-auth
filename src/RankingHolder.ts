export interface GameResult {
  name: string;
  score: number;
}

export class RankingHolder {
  private results: GameResult[] = [];

  public get average(): number | null {
    if (this.results.length === 0) {
      return null;
    }
    return this.results.reduce((pre, cur) => pre + cur.score, 0) / this.results.length;
  }

  public get highestScore(): number | null {
    if (this.results.length === 0) {
      return null;
    }
    return Math.max(...this.results.map(x => x.score));
  }

  public add(result: GameResult): void {
    this.results.push(result);
  }
}