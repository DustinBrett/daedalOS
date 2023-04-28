const MIN_TYPING_SPEED_MS = 1;
const MAX_TYPING_SPEED_MS = 150;

export const getLetterTypingSpeed = (): number => {
  const probability = Math.random();
  let max = MAX_TYPING_SPEED_MS;

  if (probability < 0.3) max = MAX_TYPING_SPEED_MS / 5;
  else if (probability < 0.6) max = MAX_TYPING_SPEED_MS / 4;
  else if (probability < 0.9) max = MAX_TYPING_SPEED_MS / 3;

  return Math.random() * (max - MIN_TYPING_SPEED_MS + 1) + MIN_TYPING_SPEED_MS;
};
