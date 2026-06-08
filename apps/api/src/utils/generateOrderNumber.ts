import crypto from 'crypto';

export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CC-${year}${month}-${randomChars}`;
};

export default generateOrderNumber;
