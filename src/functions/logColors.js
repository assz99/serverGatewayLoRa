export function logCyan(msg) {
  console.log('\x1b[36m%s\x1b[0m', `${msg}`);
}
export function logBlue(msg) {
  console.log('\x1b[34m%s\x1b[0m', `${msg}`);
}
export function logRed(msg) {
  console.log('\x1b[31m%s\x1b[0m', `${msg}`);
}
export function logGreen(msg) {
  console.log('\x1b[32m%s\x1b[0m', `${msg}`);
}
export function logYellow(msg) {
  console.log('\x1b[33m%s\x1b[0m', `${msg}`);
}