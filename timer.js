export function calculateDay(start, end, now = new Date()) {
  const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
  const s = minutes(start), e = minutes(end);
  const begin = new Date(now); begin.setHours(Math.floor(s / 60), s % 60, 0, 0);
  const finish = new Date(now); finish.setHours(Math.floor(e / 60), e % 60, 0, 0);
  if (e < s) {
    const current = now.getHours() * 60 + now.getMinutes();
    if (current < e) begin.setDate(begin.getDate() - 1);
    else finish.setDate(finish.getDate() + 1);
  }
  const duration = finish - begin;
  const ratio = Math.max(0, Math.min(1, (finish - now) / duration));
  const before = now < begin, done = now >= finish;
  const percent = done ? 0 : before ? 99 : Math.max(1, Math.round(1 + ratio * 98));
  const remainingMinutes = Math.max(0, Math.ceil((finish - Math.max(now.getTime(), begin.getTime())) / 60000));
  return { ratio, percent, before, done, hours: Math.floor(remainingMinutes / 60), minutes: remainingMinutes % 60 };
}
export function validSchedule(start, end) {
  const valid = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  return typeof start === 'string' && typeof end === 'string' && valid(start) && valid(end) && start !== end;
}
