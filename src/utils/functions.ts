/* eslint-disable import/prefer-default-export */
interface IParams {
  minMilliseconds: number;
  maxMilliseconds: number;
}

export function sleepRandomTime({
  minMilliseconds,
  maxMilliseconds,
}: IParams): Promise<void> {
  const ms =
    Math.random() * (maxMilliseconds - minMilliseconds) + minMilliseconds;
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
