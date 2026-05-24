export function createTimingLogger(label) {
  const start = performance.now();
  let previous = start;
  const marks = {};

  return {
    mark(name) {
      const now = performance.now();
      marks[name] = Math.round(now - previous);
      previous = now;
    },
    done(extra = {}) {
      console.info(`[timing:${label}]`, {
        ...marks,
        total: Math.round(performance.now() - start),
        ...extra,
      });
    },
  };
}
