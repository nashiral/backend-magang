import bcrypt from "bcrypt";

const password = "PasswordKuatBanget123!";

const hash = await bcrypt.hash(password, 10);

console.log(hash);