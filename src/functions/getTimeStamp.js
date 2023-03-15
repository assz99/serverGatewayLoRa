const offset = -4; //TimeZone escolhida

export function getTimeStamp() {
  const timeStamp = Math.round(new Date(new Date().getTime() + offset * 3600 * 1000).getTime() / 1000);
  return timeStamp;
}