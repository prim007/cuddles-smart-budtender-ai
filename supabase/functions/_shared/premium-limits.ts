// Free vs Premium allowances. The AI chat is always free and has no entry here.
export function imageDailyLimit(premium: boolean): number { return premium ? 20 : 5; }
export function scanMonthlyLimit(premium: boolean): number { return premium ? 300 : 3; }
