import bcrypt from 'bcryptjs';

const UserSeed = [
  {
    username: 'admin',
    password: bcrypt.hashSync('123456', 8),
    admin: true,
    createdAt: `${new Date()}`,
    updatedAt: `${new Date()}`,
  },
];

export default UserSeed;
