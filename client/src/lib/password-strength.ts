/** Local guidance only: never sends or stores the entered password. */
export function getPasswordStrength(password: string) {
  const criteria = [
    { label: "Au moins 8 caractères", met: password.length >= 8 },
    {
      label: "Minuscules et majuscules",
      met: /\p{Ll}/u.test(password) && /\p{Lu}/u.test(password),
    },
    { label: "Au moins un chiffre", met: /\p{N}/u.test(password) },
    {
      label: "Au moins un caractère spécial",
      met: /[^\p{L}\p{N}\s]/u.test(password),
    },
    {
      label: "12 caractères ou plus, idéalement 16",
      met: password.length >= 12,
    },
  ];
  const common =
    /^(password|motdepasse|azerty|qwerty|123456|abcdef)/i.test(password) ||
    /^(.)\1+$/u.test(password);
  const variety = criteria.slice(1, 4).filter((item) => item.met).length;
  let level = 1;
  if (password.length >= 8 && !common) {
    level = 2;
    if (
      (password.length >= 12 && variety >= 2) ||
      (password.length >= 16 && variety >= 1)
    )
      level = 3;
    if (password.length >= 16 && variety === 3) level = 4;
  }
  return { level: password ? level : 0, criteria, common };
}
